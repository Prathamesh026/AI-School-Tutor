import { retrieveRelevantChunks } from "../rag/retriever";
import { db } from "../database/db";

async function main() {
  const query = process.argv.slice(2).join(" ") || "test query";
  const chunks = await retrieveRelevantChunks(query, 3);
  console.log(chunks);
  await db.end();
}

main().catch(async (err) => {
  console.error(err);
  await db.end();
  process.exit(1);
});
