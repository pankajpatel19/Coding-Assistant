import { client } from "../config/aws.js";
import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const modelId = "amazon.titan-embed-text-v2:0";

async function getEmbedding(text) {
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
    console.error("Bedrock Invoke Error:", error);
    throw error;
  }
}

const getEmbeddings = async (chunks, batchSize = 10) => {
  try {
    const embeddings = [];
    // Process chunks in parallel batches to respect rate limits while improving speed
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const batchPromises = batch.map(async (chunk) => {
        const embedding = await getEmbedding(chunk.content);
        return {
          ...chunk,
          embedding,
        };
      });
      
      const batchResults = await Promise.all(batchPromises);
      embeddings.push(...batchResults);
    }
    return embeddings;
  } catch (error) {
    console.error("Bedrock Invoke Error:", error);
    throw error;
  }
};

export { getEmbedding, getEmbeddings };
