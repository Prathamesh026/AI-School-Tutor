import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/config";

const client = new GoogleGenerativeAI(config.GEMINI_API_KEY);
const model = client.getGenerativeModel({ model: "text-embedding-004" });

export async function createEmbedding(input: string): Promise<number[]> {
  const result = await model.embedContent(input);
  return result.embedding.values;
}
