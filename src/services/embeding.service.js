import { client } from "../config/aws.js";
import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const modelId = "amazon.titan-embed-text-v2:0";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getEmbedding(text, retries = 5) {
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
    // Throttling handling with exponential backoff (1s, 2s, 4s, 8s, 16s)
    if (error.name === "ThrottlingException" && retries > 0) {
      const waitTime = Math.pow(2, 5 - retries) * 1000;
      console.warn(
        `Throttled by Bedrock. Retrying in ${waitTime / 1000}s... (Retries left: ${retries})`,
      );
      await sleep(waitTime);
      return getEmbedding(text, retries - 1);
    }
    console.error("Bedrock Invoke Error:", error);
    throw error;
  }
}

const getEmbeddings = async (chunks, batchSize = 3) => {
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

      // Higher delay between batches to stay safe under rate limits
      if (i + batchSize < validChunks.length) {
        await sleep(500);
      }
    }
    return embeddings;
  } catch (error) {
    console.error("Bedrock Embeddings Error:", error);
    throw error;
  }
};

export { getEmbedding, getEmbeddings };
