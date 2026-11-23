// Run pending SQL migrations against the configured database.
// Usage: node scripts/migrate.mjs
import { readMigrations, getPool, closePool } from "../src/db.js";

async function main() {
  const pool = getPool();
  const migrations = await readMigrations();
  if (migrations.length === 0) {
    console.log("No migrations found.");
    await closePool();
    return;
  }
  console.log(`Applying ${migrations.length} migration(s)...`);
  for (const { filename, content } of migrations) {
    await pool.query(`BEGIN`);
    try {
      await pool.query(content);
      await pool.query(`COMMIT`);
      console.log(`  ok  ${filename}`);
    } catch (err) {
      await pool.query(`ROLLBACK`);
      console.error(`  FAIL ${filename}: ${(err as Error).message}`);
      process.exit(1);
    }
  }
  console.log("Migrations applied successfully.");
  await closePool();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
