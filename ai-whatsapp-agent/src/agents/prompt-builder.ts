import { listTools } from "../tools/tool-registry";

export type PromptInput = {
  systemInstructions: string;
  history: string;
  userFacts: string;
  retrievedDocs: string[];
  userMessage: string;
};

export function buildPrompt(input: PromptInput): string {
  const tools = listTools()
    .map((t) => `- ${t.name}: ${t.description}. params=${JSON.stringify(t.parameters)}`)
    .join("\n");

  const docs = input.retrievedDocs.slice(0, 8).map((doc, i) => `[DOC ${i + 1}] ${doc}`).join("\n");

  return `${input.systemInstructions}

You are a WhatsApp AI assistant. Use ReAct style.
If you need a tool, respond with exactly:
TOOL_CALL: {"name":"tool_name","input":{"key":"value"}}
Otherwise provide final helpful answer.

Conversation History:
${input.history || "(none)"}

User Memory Facts:
${input.userFacts || "(none)"}

Retrieved Knowledge:
${docs || "(none)"}

Available Tools:
${tools || "(none)"}

User Message:
${input.userMessage}`;
}
