import { db } from "../database/db";

function toPgVector(vector: number[]): string {
  return `[${vector.join(",")}]`;
}

export async function storeEmbedding(documentId: number, chunk: string, embedding: number[]): Promise<void> {
  await db.query(
    `INSERT INTO embeddings (document_id, chunk, embedding) VALUES ($1, $2, $3::vector)`,
    [documentId, chunk, toPgVector(embedding)]
  );
}

export async function similaritySearch(embedding: number[], topK: number): Promise<Array<{ chunk: string; score: number }>> {
  const res = await db.query(
    `SELECT chunk, 1 - (embedding <=> $1::vector) AS score
     FROM embeddings
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [toPgVector(embedding), topK]
  );

  return res.rows;
}
