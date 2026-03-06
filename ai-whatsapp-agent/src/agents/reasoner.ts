export type ToolCall = { name: string; input: Record<string, unknown> };

export function extractToolCall(text: string): ToolCall | null {
  const match = text.match(/TOOL_CALL:\s*(\{[\s\S]*\})/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[1]) as ToolCall;
    if (!parsed?.name || typeof parsed.name !== "string") return null;
    return { name: parsed.name, input: parsed.input ?? {} };
  } catch {
    return null;
  }
}
