import { db } from "../database/db";
import { logger } from "../observability/logger";
import { addUserFact, getUserFacts } from "./user-memory";
import { getRecentMessages, saveMessage } from "./conversation-memory";

export async function getOrCreateUser(phone: string): Promise<number> {
  const existing = await db.query(`SELECT id FROM users WHERE phone = $1`, [phone]);
  if (existing.rowCount && existing.rows[0]) {
    return existing.rows[0].id as number;
  }

  const created = await db.query(`INSERT INTO users (phone) VALUES ($1) RETURNING id`, [phone]);
  return created.rows[0].id as number;
}

export async function storeConversationTurn(userId: number, userText: string, assistantText: string, messageId?: string): Promise<void> {
  const sourceMessageId = await saveMessage(userId, "user", userText, messageId);
  await saveMessage(userId, "assistant", assistantText);
  await maybeExtractUserFact(userId, userText, sourceMessageId);
}

async function maybeExtractUserFact(userId: number, userText: string, sourceMessageId: number): Promise<void> {
  const marker = /(i am|my name is|i like|i prefer|my goal is|i work as|i live in)\b/i;
  if (!marker.test(userText)) return;

  const fact = userText.slice(0, 300);
  await addUserFact(userId, fact, sourceMessageId);
  logger.info("user_fact_stored", { userId, fact });
}

export async function loadMemoryContext(userId: number): Promise<{ history: string; facts: string }> {
  const [historyMessages, facts] = await Promise.all([
    getRecentMessages(userId),
    getUserFacts(userId)
  ]);

  return {
    history: historyMessages.map((m) => `${m.role}: ${m.content}`).join("\n"),
    facts: facts.map((f) => `- ${f}`).join("\n")
  };
}
