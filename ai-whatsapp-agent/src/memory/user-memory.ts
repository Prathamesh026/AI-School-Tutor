import { db } from "../database/db";

export async function addUserFact(userId: number, fact: string, sourceMessageId: number): Promise<void> {
  await db.query(
    `INSERT INTO user_memory (user_id, fact, source_message_id) VALUES ($1, $2, $3)`,
    [userId, fact, sourceMessageId]
  );
}

export async function getUserFacts(userId: number, limit = 20): Promise<string[]> {
  const res = await db.query(
    `SELECT fact FROM user_memory WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [userId, limit]
  );

  return res.rows.map((r) => r.fact);
}
