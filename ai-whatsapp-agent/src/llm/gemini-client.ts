import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/config";
import { retry } from "../utils/retry";
import { logger } from "../observability/logger";

const client = new GoogleGenerativeAI(config.GEMINI_API_KEY);
const model = client.getGenerativeModel({ model: "gemini-1.5-pro" });

export async function generateResponse(prompt: string): Promise<string> {
  return retry(async () => {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      logger.error("gemini_error", { error });
      throw error;
    }
  }, 2, 500);
}
