import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z.object({
  PORT: z.string().default("3000").transform(Number),
  VERIFY_TOKEN: z.string().min(1),
  WHATSAPP_TOKEN: z.string().min(1),
  PHONE_NUMBER_ID: z.string().min(1),
  WHATSAPP_APP_SECRET: z.string().optional(),
  DATABASE_URL: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  MAX_REASONING_STEPS: z.string().default("4").transform(Number),
  TOP_K: z.string().default("5").transform(Number),
  RATE_LIMIT_WINDOW_MS: z.string().default("60000").transform(Number),
  RATE_LIMIT_MAX: z.string().default("30").transform(Number)
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

export const config = parsed.data;
