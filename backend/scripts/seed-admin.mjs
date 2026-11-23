// Seed the initial owner account from ADMIN_PASSWORD (one-time bootstrap).
// Usage: ADMIN_PASSWORD=`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))" DATABASE_URL=... node scripts/seed-admin.mjs
import { hashPassword } from "../src/auth.js";
import { getPool } from "../src/db.js";
import { env } from "../src/config.js";

async function main() {
  if (!process.env.ADMIN_PASSWORD) {
    console.error("ADMIN_PASSWORD is required (bootstrap only).");
    process.exit(1);
  }
  const pool = getPool();
  const business = await pool.query(
    `SELECT id FROM businesses ORDER BY created_at LIMIT 1`
  );
  const businessId = business.rows[0]?.id;
  if (!businessId) {
    console.error("No business found. Run migrations first.");
    process.exit(1);
  }
  const existing = await pool.query(
    `SELECT id FROM users WHERE email = $1`, [process.env.ADMIN_EMAIL || "owner@jarvis.shop"]
  );
  if (existing.rows[0]) {
    console.log("Owner account already exists.");
    await closePool();
    return;
  }
  const passwordHash = await hashPassword(process.env.ADMIN_PASSWORD);
  const res = await pool.query(
    `INSERT INTO users (email, password_hash, name, role, business_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role`,
    [process.env.ADMIN_EMAIL || "owner@jarvis.shop", passwordHash, "Owner", "owner", businessId]
  );
  console.log(`Owner account created: ${res.rows[0].id} / ${process.env.ADMIN_PASSWORD} (change it in Settings!)`);
  await closePool();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
