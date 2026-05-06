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

const getEmbeddings = async (chunks) => {
  try {
    const embeddings = [];
    for (const chunk of chunks) {
      const embedding = await getEmbedding(chunk.content);
      embeddings.push({
        ...chunk,
        embedding,
      });
    }
    return embeddings;
  } catch (error) {
    console.error("Bedrock Invoke Error:", error);
    throw error;
  }
};

export { getEmbedding, getEmbeddings };
