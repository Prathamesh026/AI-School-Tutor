import axios from "axios";
import type { Tool } from "./tool-registry";

export const webSearchTool: Tool = {
  name: "web_search",
  description: "Search the web for recent information.",
  parameters: {
    query: "string"
  },
  async execute(input) {
    const query = String(input.query ?? "");
    if (!query) return "No query provided.";

    try {
      const response = await axios.get("https://api.duckduckgo.com", {
        params: { q: query, format: "json", no_redirect: 1, no_html: 1 }
      });
      const abstract = response.data?.AbstractText as string | undefined;
      return abstract || `Web search completed for '${query}', but no concise abstract was found.`;
    } catch {
      return `Web search unavailable for '${query}'.`;
    }
  }
};
