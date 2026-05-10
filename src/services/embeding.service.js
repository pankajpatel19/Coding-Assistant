import { client } from "../config/aws.js";
import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const EMBEDDING_MODEL_ID = "amazon.titan-embed-text-v2:0";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getEmbedding(text) {
  try {
    if (!text || text.trim().length === 0) {
      console.warn("Skipping empty text for embedding.");
      return null;
    }

    const payload = {
      inputText: text,
      dimensions: 1024,
      normalize: true,
    };

    const command = new InvokeModelCommand({
      modelId: EMBEDDING_MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    const response = await client.send(command);
    const body = JSON.parse(Buffer.from(response.body).toString("utf-8"));
    return body.embedding;
  } catch (error) {
    if (error.name === "ThrottlingException") {
      console.warn("Throttled by Bedrock. Waiting 2 seconds...");
      await sleep(2000);
      return getEmbedding(text); // Simple retry
    }
    console.error("Bedrock v2 Embedding Error:", error.message);
    throw error;
  }
}

/**
 * Generate embeddings sequentially with a small delay to prevent Throttling
 */
async function getEmbeddings(chunks) {
  try {
    const validChunks = chunks.filter(
      (chunk) => chunk.content && chunk.content.trim().length > 0,
    );

    console.log(
      `Generating Bedrock v2 (1024 dims) embeddings for ${validChunks.length} chunks...`,
    );
    const embeddings = [];

    for (let i = 0; i < validChunks.length; i++) {
      const chunk = validChunks[i];
      const vector = await getEmbedding(chunk.content);
      if (!vector) continue;

      embeddings.push({ ...chunk, embedding: vector });

      // Small progress log every 10 chunks
      if ((i + 1) % 10 === 0 || i === validChunks.length - 1) {
        console.log(`Progress: ${i + 1}/${validChunks.length} chunks...`);
      }

      // Small delay between requests to stay under rate limits
      await sleep(100);
    }

    return embeddings;
  } catch (error) {
    console.error("Batch Embedding Error:", error.message);
    throw error;
  }
}

export { getEmbedding, getEmbeddings };
