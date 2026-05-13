import { parseRepoUrl } from "../helper/parseData.js";
import { invokeBedrock } from "../services/bedrockInvoke.service.js";
import { buildChunk } from "../services/chunkers.service.js";
import { getEmbeddings, getEmbedding } from "../services/embeding.service.js";
import { getFileContent, getRepoFiles } from "../services/github.service.js";
import { retrieveCode } from "../services/retriever.service.js";
import {
  isIndexed,
  saveChunks,
  searchChunks,
  clearTable,
  getAllChunks,
  getIndexedRepos,
} from "../services/vectordb.service.js";

// Session-based storage: replaces global state for multi-user scalability.
// For production, replace this Map with Redis or a database-backed store.
const sessions = new Map();
const INITIAL_CREDITS = 3;

const getSession = (req) => {
  const sessionId =
    req.headers["x-session-id"] ||
    req.body.sessionId ||
    req.ip ||
    "default-session";
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      cacheRepo: null,
      cacheChunks: null,
      conversationHistory: [],
      historySummary: null, // rolling summary of older turns
      embeddingChunks: [],
      creditsRemaining: INITIAL_CREDITS,
    });
  }
  return { sessionId, state: sessions.get(sessionId) };
};

const rerankChunks = (chunks, question) => {
  if (!chunks || !Array.isArray(chunks)) return [];
  const stopWords = new Set([
    "the",
    "and",
    "for",
    "what",
    "how",
    "does",
    "this",
    "that",
    "are",
    "was",
  ]);
  const keywords = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w));

  return chunks
    .map((chunk) => {
      const pathLower = chunk.filePath.toLowerCase();
      const contentLower = chunk.content.toLowerCase();
      let score = 0;
      for (const kw of keywords) {
        if (pathLower.includes(kw)) score += 2;
        if (contentLower.includes(kw)) score += 1;
      }
      return { ...chunk, _score: score };
    })
    .sort((a, b) => b._score - a._score);
};
const MAX_VERBATIM_PAIRS = 3;
const trimHistory = (history, summary) => {
  const VERBATIM_ENTRIES = MAX_VERBATIM_PAIRS * 2;
  if (history.length <= VERBATIM_ENTRIES) {
    return { trimmed: history, newSummary: summary };
  }

  const older = history.slice(0, history.length - VERBATIM_ENTRIES);
  const recent = history.slice(history.length - VERBATIM_ENTRIES);

  // Build a short textual summary of the older turns
  const olderSummary = older
    .filter((e) => e.role === "user")
    .map((e) => e.question)
    .join("; ");
  const combined = summary ? `${summary} | ${olderSummary}` : olderSummary;

  return { trimmed: recent, newSummary: combined };
};

const indexRepo = async (req, res) => {
  try {
    const { repoUrl, force = false } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ message: "Repo url is required" });
    }
    const { owner, repo } = parseRepoUrl(repoUrl);
    const { state } = getSession(req);

    const alreadyIndexed = await isIndexed(repoUrl);

    if (!force && alreadyIndexed) {
      state.cacheRepo = repoUrl;
      // RESTORE: Load chunks from LanceDB back into memory if session was lost
      if (!state.cacheChunks || state.cacheChunks.length === 0) {
        console.log("Restoring session from Pinecone...");
        state.cacheChunks = await getAllChunks(state.cacheRepo);
      }
      return res.status(200).json({
        success: true,
        repo: repoUrl,
        message: "Session restored from index",
      });
    }

    if (force && alreadyIndexed) {
      console.log("clearing cache");
      await clearTable(repoUrl);
    }

    const chunks = await buildChunk(owner, repo, getRepoFiles, getFileContent);

    const embededChunks = await getEmbeddings(chunks);

    await saveChunks(embededChunks, repoUrl);

    state.embeddingChunks = embededChunks;
    state.cacheRepo = repoUrl;
    state.cacheChunks = chunks;
    const totalChunks = chunks.length;
    state.conversationHistory = [];

    return res.status(201).json({
      success: true,
      message: "Repo indexed with embeddings",
      cacheRepo: state.cacheRepo,
      totalChunks,
    });
  } catch (error) {
    console.error("Error during repo indexing:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to index repo",
    });
  }
};

const askedQuestion = async (req, res) => {
  try {
    const { question, mode = "semantic" } = req.body;
    const { state } = getSession(req);
    console.log(question);

    if (state.creditsRemaining <= 0) {
      return res.status(403).json({
        success: false,
        message: "No credits left. You have used your 3 free questions.",
        creditsRemaining: 0,
      });
    }

    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question is required" });
    }

    if (
      !state.cacheRepo ||
      !state.cacheChunks ||
      state.cacheChunks.length === 0
    ) {
      return res
        .status(400)
        .json({
          message: "No repo indexed or session expired. Please re-index.",
        });
    }

    let relevent = [];
    if (mode === "semantic") {
      const embedding = await getEmbedding(question);
      // Pass repo so search is scoped to the currently indexed repository
      relevent = await searchChunks(state.cacheRepo, embedding);
    } else {
      relevent = await retrieveCode(question, state.cacheChunks);
    }

    if (relevent.length === 0) {
      return res.status(404).json({ message: "No matching chunks found" });
    }

    // Keyword-based reranking: boost files whose path/content match question keywords
    const reranked = rerankChunks(relevent, question);

    const context = reranked
      .map((chunk) => `// File: ${chunk.filePath}\n${chunk.content}`)
      .join("\n\n");

    // Build history to send to Bedrock — prepend rolling summary if one exists
    const historyToSend = state.historySummary
      ? [
          {
            role: "user",
            question: `[Context from earlier turns]: ${state.historySummary}`,
            context: "",
          },
          ...state.conversationHistory,
        ]
      : [...state.conversationHistory];

    historyToSend.push({ role: "user", question, context });

    const answer = await invokeBedrock(historyToSend);

    state.creditsRemaining -= 1;

    state.conversationHistory.push({ role: "user", question, context });
    state.conversationHistory.push({ role: "assistant", answer });

    const { trimmed, newSummary } = trimHistory(
      state.conversationHistory,
      state.historySummary,
    );
    state.conversationHistory = trimmed;
    state.historySummary = newSummary;

    return res.status(200).json({
      success: true,
      message: "Question answered successfully",
      answer,
      summary: state.historySummary,
      creditsRemaining: state.creditsRemaining,
    });
  } catch (error) {
    console.error("Error during asking question:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to ask question",
    });
  }
};

const clearHistory = async (req, res) => {
  try {
    const { state } = getSession(req);
    state.conversationHistory = [];
    return res.status(200).json({
      success: true,
      message: "History cleared successfully",
    });
  } catch (error) {
    console.error("Error during clearing history:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to clear history",
    });
  }
};

const getHistory = async (req, res) => {
  try {
    const repos = await getIndexedRepos();
    return res.status(200).json({ success: true, repos });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { indexRepo, askedQuestion, clearHistory, getHistory };
