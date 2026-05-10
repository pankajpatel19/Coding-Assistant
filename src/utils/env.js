import dotenv from "dotenv";
dotenv.config();

export const AWS_REGION = process.env.AWS_REGION;
export const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
export const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
export const PORT = process.env.PORT;
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
export const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
export const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;
export const PINECONE_CLOUD = process.env.PINECONE_CLOUD || "aws";
export const PINECONE_REGION = process.env.PINECONE_REGION || "us-east-1";
export const PINECONE_METRIC = process.env.PINECONE_METRIC || "cosine";

export const checkEnv = () => {
  if (
    !PORT ||
    !AWS_REGION ||
    !AWS_ACCESS_KEY ||
    !AWS_SECRET_KEY ||
    !GITHUB_TOKEN ||
    !PINECONE_API_KEY
  ) {
    throw new Error("Missing environment variables");
  }
};
