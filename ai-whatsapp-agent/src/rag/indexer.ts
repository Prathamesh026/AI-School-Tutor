import { db } from "../database/db";
import { chunkText } from "./chunker";
import { createEmbedding } from "./embedding";
import { storeEmbedding } from "./vectorstore";

export async function indexDocument(title: string, content: string, metadata: Record<string, unknown> = {}): Promise<number> {
  const docRes = await db.query(
    `INSERT INTO documents (title, content, metadata) VALUES ($1, $2, $3) RETURNING id`,
    [title, content, metadata]
  );

  const documentId = docRes.rows[0].id as number;
  const chunks = chunkText(content);

  for (const chunk of chunks) {
    const embedding = await createEmbedding(chunk);
    await storeEmbedding(documentId, chunk, embedding);
  }

  return documentId;
}
