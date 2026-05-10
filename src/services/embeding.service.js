import { pipeline } from "@xenova/transformers";

let extractor = null;

// Initialize the model (Singleton pattern)
async function getExtractor() {
  if (!extractor) {
    console.log("Loading Local Embedding Model (all-MiniLM-L6-v2)...");
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("Model Loaded Successfully.");
  }
  return extractor;
}

/**
 * Generates a single embedding locally.
 */
async function getEmbedding(text) {
  try {
    const extract = await getExtractor();
    const output = await extract(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  } catch (error) {
    console.error("Local Embedding Error:", error);
    throw error;
  }
}

/**
 * Generates embeddings for multiple chunks at high speed.
 * No throttling or batch delays needed for local processing.
 */
const getEmbeddings = async (chunks) => {
  try {
    const validChunks = chunks.filter(
      (chunk) => chunk.content && chunk.content.trim().length > 0,
    );

    console.log(`Starting Local Indexing for ${validChunks.length} chunks...`);
    const startTime = Date.now();

    const embeddings = [];
    const extract = await getExtractor();

    // Process in small groups for better memory management during high-speed extraction
    const groupSize = 10;
    for (let i = 0; i < validChunks.length; i += groupSize) {
      const group = validChunks.slice(i, i + groupSize);

      const groupPromises = group.map(async (chunk) => {
        const output = await extract(chunk.content, {
          pooling: "mean",
          normalize: true,
        });
        return {
          ...chunk,
          embedding: Array.from(output.data),
        };
      });

      const groupResults = await Promise.all(groupPromises);
      embeddings.push(...groupResults);

      if (i % 50 === 0 && i > 0) {
        console.log(`Progress: ${i}/${validChunks.length} chunks indexed...`);
      }
    }

    const endTime = Date.now();
    console.log(`Indexing Complete! Took ${(endTime - startTime) / 1000}s.`);
    return embeddings;
  } catch (error) {
    console.error("Local Batch Indexing Error:", error);
    throw error;
  }
};

export { getEmbedding, getEmbeddings };
