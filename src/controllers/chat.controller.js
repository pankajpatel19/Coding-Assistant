import { parseRepoUrl } from "../helper/parseData.js";
import { invokeBedrock } from "../services/bedrockInvoke.service.js";
import { buildChunk } from "../services/chunkers.service.js";
import { getFileContent, getRepoFiles } from "../services/github.service.js";
import { retrieveCode } from "../services/retriever.service.js";

let cacheRepo = null;
let cacheChunks = null;
let conversationHistory = [];

const indexRepo = async (req, res) => {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ message: "Repo url is required" });
    }
    const { owner, repo } = parseRepoUrl(repoUrl);

    const chunks = await buildChunk(owner, repo, getRepoFiles, getFileContent);
    const totalChunks = chunks.length;
    cacheRepo = `${owner}/${repo}`;
    cacheChunks = chunks;

    conversationHistory = [];

    return res.status(200).json({
      success: true,
      message: "Repo indexed successfully",
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
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    if (!cacheRepo || cacheChunks.length === 0) {
      return res.status(400).json({ message: "No repo indexed" });
    }

    const retriverChunks = await retrieveCode(question, cacheChunks);

    if (retriverChunks.length === 0) {
      return res.status(404).json({ message: "No matching chunks found" });
    }

    const context = retriverChunks
      .map((chunk) => `// File: ${chunk.filePath}\n${chunk.content}`)
      .join("\n\n");
    conversationHistory.push({ role: "user", question, context });

    const answer = await invokeBedrock(conversationHistory);

    conversationHistory.push({ role: "assistant", answer });
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
