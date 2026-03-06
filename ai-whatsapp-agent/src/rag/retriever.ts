import { config } from "../config/config";
import { createEmbedding } from "./embedding";
import { similaritySearch } from "./vectorstore";

export async function retrieveRelevantChunks(query: string, topK = config.TOP_K): Promise<string[]> {
  const queryEmbedding = await createEmbedding(query);
  const rows = await similaritySearch(queryEmbedding, topK);
  return rows.map((row) => row.chunk);
}
