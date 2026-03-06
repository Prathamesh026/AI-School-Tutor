import fs from "fs/promises";
import path from "path";
import { indexDocument } from "../rag/indexer";
import { db } from "../database/db";

async function main() {
  const docsDir = path.join(process.cwd(), "docs");
  const files = await fs.readdir(docsDir);

  for (const file of files) {
    if (!file.endsWith(".txt") && !file.endsWith(".md")) continue;
    const fullPath = path.join(docsDir, file);
    const content = await fs.readFile(fullPath, "utf8");
    const id = await indexDocument(file, content, { source: file });
    console.log(`Indexed ${file} as document ${id}`);
  }

  await db.end();
}

main().catch(async (err) => {
  console.error(err);
  await db.end();
  process.exit(1);
});
