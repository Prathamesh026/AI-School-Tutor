import { buildPrompt } from "./prompt-builder";

export function createPlanPrompt(params: {
  history: string;
  facts: string;
  docs: string[];
  message: string;
}): string {
  return buildPrompt({
    systemInstructions:
      "You are a safe and accurate assistant. Use tools when needed for external actions or lookup.",
    history: params.history,
    userFacts: params.facts,
    retrievedDocs: params.docs,
    userMessage: params.message
  });
}
