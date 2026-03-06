import fs from "fs/promises";
import path from "path";
import { db } from "../database/db";

async function main() {
  const schemaPath = path.join(__dirname, "..", "database", "schema.sql");
  const sql = await fs.readFile(schemaPath, "utf8");
  await db.query(sql);
  console.log("Database setup complete");
  await db.end();
}

main().catch(async (err) => {
  console.error(err);
  await db.end();
  process.exit(1);
});
