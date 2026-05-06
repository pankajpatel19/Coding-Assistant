import dotenv from "dotenv";
dotenv.config();

export const AWS_REGION = process.env.AWS_REGION;
export const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
export const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
export const PORT = process.env.PORT;
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export const checkEnv = () => {
  if (
    !PORT ||
    !AWS_REGION ||
    !AWS_ACCESS_KEY ||
    !AWS_SECRET_KEY ||
    !GITHUB_TOKEN
  ) {
    throw new Error("Missing environment variables");
  }
};
