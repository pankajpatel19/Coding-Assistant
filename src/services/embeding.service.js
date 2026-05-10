import { client } from "../config/aws.js";
import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const modelId = "amazon.titan-embed-text-v2:0";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getEmbedding(text, retries = 3) {
  const payload = {
    inputText: text,
  };

  const command = new InvokeModelCommand({
    modelId: modelId,
    accept: "application/json",
    contentType: "application/json",
    body: JSON.stringify(payload),
  });

  try {
    const res = await client.send(command);
    const result = JSON.parse(Buffer.from(res.body).toString("utf-8"));
    return result.embedding;
  } catch (error) {
    // Handle Throttling with exponential backoff
    if (error.name === "ThrottlingException" && retries > 0) {
      console.warn(`Throttled. Retrying in ${4 - retries}s...`);
      await sleep(1000 * (4 - retries));
      return getEmbedding(text, retries - 1);
    }
    console.error("Bedrock Invoke Error:", error);
    throw error;
  }
}

const getEmbeddings = async (chunks, batchSize = 10) => {
  try {
    const validChunks = chunks.filter(
      (chunk) => chunk.content && chunk.content.trim().length > 0,
    );
    const embeddings = [];

    for (let i = 0; i < validChunks.length; i += batchSize) {
      const batch = validChunks.slice(i, i + batchSize);

      const batchPromises = batch.map(async (chunk) => {
        const embedding = await getEmbedding(chunk.content);
        return {
          ...chunk,
          embedding,
        };
      });

      const batchResults = await Promise.all(batchPromises);
      embeddings.push(...batchResults);

      // Add a small delay between batches to stay under rate limits
      if (i + batchSize < validChunks.length) {
        await sleep(200);
      }
    }
    return embeddings;
  } catch (error) {
    console.error("Bedrock Embeddings Error:", error);
    throw error;
  }
};

export { getEmbedding, getEmbeddings };
