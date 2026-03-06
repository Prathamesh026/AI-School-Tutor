import { db } from "../database/db";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function saveMessage(userId: number, role: "user" | "assistant", content: string, messageId?: string): Promise<number> {
  const res = await db.query(
    `INSERT INTO messages (user_id, role, content, message_id) VALUES ($1, $2, $3, $4) RETURNING id`,
    [userId, role, content, messageId ?? null]
  );
  return res.rows[0].id as number;
}

export async function getRecentMessages(userId: number, limit = 12): Promise<ChatMessage[]> {
  const res = await db.query(
    `SELECT role, content
     FROM messages
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );

  return res.rows.reverse();
}
