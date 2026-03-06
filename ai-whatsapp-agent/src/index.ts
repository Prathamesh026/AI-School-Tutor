import { createApp } from "./server/express";
import { config } from "./config/config";
import { registerTool } from "./tools/tool-registry";
import { schedulerTool } from "./tools/scheduler-tool";
import { webSearchTool } from "./tools/web-search-tool";
import { knowledgeTool } from "./tools/knowledge-tool";
import { logger } from "./observability/logger";

registerTool(schedulerTool);
registerTool(webSearchTool);
registerTool(knowledgeTool);

const app = createApp();

app.listen(config.PORT, () => {
  logger.info("server_started", { port: config.PORT });
});
