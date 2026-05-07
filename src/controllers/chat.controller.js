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
} from "../services/vectordb.service.js";

let cacheRepo = null;
let cacheChunks = null;
let conversationHistory = [];
let embeddingChunks = [];

const indexRepo = async (req, res) => {
  try {
    const { repoUrl, force = false } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ message: "Repo url is required" });
    }
    const { owner, repo } = parseRepoUrl(repoUrl);

    const alreadyIndexed = await isIndexed(repoUrl);

    if (!force && alreadyIndexed) {
      cacheRepo = `${owner}/${repo}`;
      return res.status(200).json({
        success: true,
        repo: repoUrl,
        message: "Repo is already indexed Use force to index again",
      });
    }

    if (force && alreadyIndexed) {
      console.log("clearing cache");
      await clearTable();
    }

    const chunks = await buildChunk(owner, repo, getRepoFiles, getFileContent);

    const embededChunks = await getEmbeddings(chunks);

    await saveChunks(embededChunks);

    embeddingChunks = embededChunks;
    cacheRepo = `${owner}/${repo}`;
    cacheChunks = chunks;
    const totalChunks = chunks.length;
    conversationHistory = [];

    return res.status(201).json({
      success: true,
      message: "Repo indexed with embeddings",
      cacheRepo,
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
    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    if (!cacheRepo || cacheChunks?.length === 0) {
      return res.status(400).json({ message: "No repo indexed" });
    }
    let relevent = [];
    if (mode === "semantic") {
      const embedding = await getEmbedding(question);
      relevent = await searchChunks(embedding);
    } else {
      relevent = await retrieveCode(question, cacheChunks);
    }

    if (relevent.length === 0) {
      return res.status(404).json({ message: "No matching chunks found" });
    }

    const context = relevent
      .map((chunk) => `// File: ${chunk.filePath}\n${chunk.content}`)
      .join("\n\n");
    conversationHistory.push({ role: "user", question, context });

    const answer = await invokeBedrock(conversationHistory);

    conversationHistory.push({ role: "assistant", answer });

    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }
    return res.status(200).json({
      success: true,
      message: "Question answered successfully",
      answer,
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
    conversationHistory = [];
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

export { indexRepo, askedQuestion, clearHistory };
