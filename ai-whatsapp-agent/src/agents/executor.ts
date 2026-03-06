import { getTool } from "../tools/tool-registry";

export async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  const tool = getTool(name);
  if (!tool) return `Tool '${name}' is not registered.`;
  return tool.execute(input);
}
