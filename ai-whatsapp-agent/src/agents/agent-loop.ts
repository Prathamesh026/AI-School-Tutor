import { config } from "../config/config";
import { logger } from "../observability/logger";
import { metrics } from "../observability/metrics";
import { generateResponse } from "../llm/gemini-client";
import { retrieveRelevantChunks } from "../rag/retriever";
import { createPlanPrompt } from "./planner";
import { extractToolCall } from "./reasoner";
import { executeTool } from "./executor";

export async function runAgentLoop(input: {
  message: string;
  history: string;
  facts: string;
}): Promise<string> {
  const started = Date.now();
  const docs = await retrieveRelevantChunks(input.message);
  let prompt = createPlanPrompt({
    history: input.history,
    facts: input.facts,
    docs,
    message: input.message
  });

  for (let step = 0; step < config.MAX_REASONING_STEPS; step += 1) {
    logger.info("llm_prompt", { step, prompt });
    const llmResponse = await generateResponse(prompt);
    logger.info("llm_response", { step, llmResponse });

    const toolCall = extractToolCall(llmResponse);
    if (!toolCall) {
      metrics.timing("agent_loop_latency", Date.now() - started);
      return llmResponse;
    }

    metrics.increment(`tool_usage_${toolCall.name}`);
    const toolResult = await executeTool(toolCall.name, toolCall.input);
    logger.info("tool_call", { step, tool: toolCall, toolResult });

    prompt = `${prompt}\n\nTool Result (${toolCall.name}):\n${toolResult}\n\nNow provide the final user response.`;
  }

  metrics.timing("agent_loop_latency", Date.now() - started);
  return "I could not complete reasoning safely in time. Please rephrase your request.";
}
