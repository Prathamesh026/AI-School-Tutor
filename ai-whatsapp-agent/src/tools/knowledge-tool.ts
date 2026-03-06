import type { Tool } from "./tool-registry";
import { retrieveRelevantChunks } from "../rag/retriever";

export const knowledgeTool: Tool = {
  name: "knowledge_lookup",
  description: "Retrieve domain knowledge from indexed documents.",
  parameters: {
    query: "string"
  },
  async execute(input) {
    const query = String(input.query ?? "");
    if (!query) return "No query provided.";

    const chunks = await retrieveRelevantChunks(query, 3);
    if (!chunks.length) return "No knowledge found.";
    return chunks.map((chunk, i) => `[${i + 1}] ${chunk}`).join("\n");
  }
};
