import crypto from "crypto";
import { Router, type Request, type Response } from "express";
import { config } from "../../config/config";
import { parseIncomingMessage } from "./parser";
import { logger } from "../../observability/logger";
import { allowRequest } from "../../utils/rate-limit";
import { getOrCreateUser, loadMemoryContext, storeConversationTurn } from "../../memory/memory-manager";
import { runAgentLoop } from "../../agents/agent-loop";
import { sendWhatsAppMessage } from "./sender";

function verifySignature(req: Request): boolean {
  if (!config.WHATSAPP_APP_SECRET) return true;

  const signature = req.header("x-hub-signature-256");
  if (!signature) return false;

  const expected = `sha256=${crypto
    .createHmac("sha256", config.WHATSAPP_APP_SECRET)
    .update((req as Request & { rawBody?: string }).rawBody ?? "")
    .digest("hex")}`;

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export const webhookRouter = Router();

webhookRouter.get("/webhook", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === config.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.status(403).send("Forbidden");
});

webhookRouter.post("/webhook", async (req: Request, res: Response) => {
  if (!verifySignature(req)) {
    logger.warn("invalid_signature");
    return res.status(401).send("Invalid signature");
  }

  const events = parseIncomingMessage(req.body);
  if (!events.length) return res.status(200).send("No message events");

  for (const event of events) {
    if (!allowRequest(event.phone)) {
      await sendWhatsAppMessage(event.phone, "Rate limit exceeded. Please wait a moment.");
      continue;
    }

    logger.info("incoming_message", event);
    const userId = await getOrCreateUser(event.phone);
    const memory = await loadMemoryContext(userId);

    const answer = await runAgentLoop({
      message: event.text,
      history: memory.history,
      facts: memory.facts
    });

    await storeConversationTurn(userId, event.text, answer, event.messageId);
    await sendWhatsAppMessage(event.phone, answer);
  }

  return res.sendStatus(200);
});
