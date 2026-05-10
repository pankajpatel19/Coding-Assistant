import { Pinecone, Errors } from "@pinecone-database/pinecone";
import {
  PINECONE_INDEX_NAME,
  PINECONE_API_KEY,
  PINECONE_CLOUD,
  PINECONE_REGION,
  PINECONE_METRIC,
} from "../utils/env.js";

// Standardizing on 1024 dimensions for Titan v2
const VECTOR_DIMENSION = 1024;
const INDEX_NAME = PINECONE_INDEX_NAME || `code-assistant-${VECTOR_DIMENSION}`;
const DUMMY_QUERY_VECTOR = [1, ...new Array(VECTOR_DIMENSION - 1).fill(0)];

let pinecone = null;
let index = null;

const isNotFoundError = (error) =>
  error instanceof Errors.PineconeNotFoundError ||
  error?.name === "PineconeNotFoundError" ||
  error?.message?.includes("HTTP status 404");

const isValidDenseVector = (embedding) =>
  Array.isArray(embedding) &&
  embedding.length === VECTOR_DIMENSION &&
  embedding.every((value) => Number.isFinite(value)) &&
  embedding.some((value) => value !== 0);

async function ensureIndex() {
  try {
    const description = await pinecone.describeIndex(INDEX_NAME);

    if (description.dimension !== VECTOR_DIMENSION) {
      throw new Error(
        `Pinecone index "${INDEX_NAME}" has ${description.dimension} dimensions, but this app generates ${VECTOR_DIMENSION}-dimension Titan embeddings. Use a ${VECTOR_DIMENSION}-dimension index or update PINECONE_INDEX_NAME.`,
      );
    }

    return description;
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error;
    }

    console.log(
      `Pinecone index "${INDEX_NAME}" was not found. Creating ${VECTOR_DIMENSION}-dimension serverless index in ${PINECONE_CLOUD}/${PINECONE_REGION}...`,
    );

    await pinecone.createIndex({
      name: INDEX_NAME,
      dimension: VECTOR_DIMENSION,
      metric: PINECONE_METRIC,
      spec: {
        serverless: {
          cloud: PINECONE_CLOUD,
          region: PINECONE_REGION,
        },
      },
      suppressConflicts: true,
      waitUntilReady: true,
    });

    return pinecone.describeIndex(INDEX_NAME);
  }
}

async function connectDB() {
  try {
    if (!pinecone) {
      pinecone = new Pinecone({
        apiKey: PINECONE_API_KEY || process.env.PINECONE_API_KEY,
      });
    }

    if (!index) {
      await ensureIndex();
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

    const records = chunks
      .filter((c) => isValidDenseVector(c.embedding))
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

    const skippedCount = chunks.length - records.length;
    if (skippedCount > 0) {
      console.warn(
        `Skipped ${skippedCount} chunks with empty, invalid, or all-zero embeddings.`,
      );
    }

    if (records.length === 0) {
      throw new Error(
        `No valid non-zero ${VECTOR_DIMENSION}-dimension embeddings available to save.`,
      );
    }

    const index = await connectDB();

    console.log(
      `Upserting ${records.length} records to Pinecone (1024 dims)...`,
    );
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await index.upsert({ records: batch });
    }
    console.log(`Success for ${repoUrl}`);
  } catch (error) {
    console.error("Error saving chunks:", error.message);
    throw error;
  }
};

const searchChunks = async (repoUrl, embedding, k = 15) => {
  try {
    if (!Array.isArray(embedding) || embedding.length !== VECTOR_DIMENSION) {
      throw new Error(
        `Dimension mismatch: expected ${VECTOR_DIMENSION}, got ${embedding?.length}.`,
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
      vector: DUMMY_QUERY_VECTOR,
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
      vector: DUMMY_QUERY_VECTOR,
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
  } catch (error) {
    console.error("Error clearing index:", error.message);
    throw error;
  }
};

const getIndexedRepos = async () => [];

export {
  isIndexed,
  searchChunks,
  saveChunks,
  clearTable,
  getAllChunks,
  getIndexedRepos,
};
