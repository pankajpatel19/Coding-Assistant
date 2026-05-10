import { Pinecone } from "@pinecone-database/pinecone";
import { PINECONE_INDEX_NAME, PINECONE_API_KEY } from "../utils/env.js";

const INDEX_NAME = PINECONE_INDEX_NAME || "code-assistant-384";
const VECTOR_DIMENSION = 384;

let pinecone = null;
let index = null;

async function connectDB() {
  try {
    if (!pinecone) {
      pinecone = new Pinecone({
        apiKey: PINECONE_API_KEY || process.env.PINECONE_API_KEY,
      });
      index = pinecone.index(INDEX_NAME);
    }
    return index;
  } catch (error) {
    console.error("Error connecting to Pinecone:", error);
    throw error;
  }
}

const saveChunks = async (chunks, repoUrl) => {
  try {
    if (!chunks || chunks.length === 0) return true;
    const index = await connectDB();

    const records = chunks
      .filter((c) => c.embedding && c.embedding.length === VECTOR_DIMENSION)
      .map((chunk, idx) => ({
        id: `${repoUrl}-${idx}-${Date.now()}`,
        values: chunk.embedding,
        metadata: {
          filePath: chunk.filePath || "unknown",
          content: String(chunk.content || ""),
          language: chunk.language || "generic",
          repo: repoUrl,
        },
      }));

    if (records.length === 0) {
      throw new Error(
        `No ${VECTOR_DIMENSION}-dimension embeddings were available to save.`,
      );
    }

    // Pinecone upsert limit handle karne ke liye batching
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await index.upsert({ records: batch });
    }

    console.log(
      `✅ ${records.length} Chunks saved successfully for ${repoUrl}`,
    );
  } catch (error) {
    console.error("Error saving chunks:", error.message);
    throw error;
  }
};

const searchChunks = async (repoUrl, embedding, k = 12) => {
  try {
    if (!Array.isArray(embedding) || embedding.length !== VECTOR_DIMENSION) {
      throw new Error(
        `Search vector dimension must be ${VECTOR_DIMENSION}, received ${embedding?.length || 0}.`,
      );
    }

    const index = await connectDB();
    const result = await index.query({
      vector: embedding,
      topK: k,
      includeMetadata: true,
      filter: { repo: { $eq: repoUrl } },
    });

    return result.matches.map((match) => ({
      filePath: match.metadata.filePath,
      content: match.metadata.content,
      language: match.metadata.language,
      repo: match.metadata.repo,
      score: match.score,
    }));
  } catch (error) {
    console.error("Error searching chunks:", error.message);
    throw error;
  }
};

const getAllChunks = async (repoUrl) => {
  try {
    const index = await connectDB();
    const result = await index.query({
      vector: new Array(VECTOR_DIMENSION).fill(0),
      topK: 1000,
      includeMetadata: true,
      filter: { repo: { $eq: repoUrl } },
    });

    return result.matches.map((match) => ({
      filePath: match.metadata.filePath,
      content: match.metadata.content,
      language: match.metadata.language,
      repo: match.metadata.repo,
    }));
  } catch (error) {
    console.error("Error getting all chunks:", error.message);
    return [];
  }
};

const isIndexed = async (repoUrl) => {
  try {
    const index = await connectDB();
    const result = await index.query({
      vector: new Array(VECTOR_DIMENSION).fill(0),
      topK: 1,
      filter: { repo: { $eq: repoUrl } },
    });
    return result.matches.length > 0;
  } catch (error) {
    return false;
  }
};

const clearTable = async (repoUrl) => {
  try {
    const index = await connectDB();
    await index.deleteMany({ filter: { repo: { $eq: repoUrl } } });
    console.log("Index cleared for repo:", repoUrl);
  } catch (error) {
    console.error("Error clearing index:", error.message);
    throw error;
  }
};

const getIndexedRepos = async () => {
  return []; // Simplified for now
};

export {
  isIndexed,
  searchChunks,
  saveChunks,
  clearTable,
  getAllChunks,
  getIndexedRepos,
};
