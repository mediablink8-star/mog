import express from "express";
import helmet from "helmet";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pg from "pg";
import crypto from "node:crypto";

const { Pool } = pg;
const app = express();
const port = Number(process.env.PORT || 10000);
const jwtSecret = process.env.JWT_SECRET;
const adminPassword = process.env.JARVIS_ADMIN_PASSWORD;
const databaseUrl = process.env.DATABASE_URL;
const allowedOrigin = process.env.CORS_ORIGIN || "*";
const pool = databaseUrl ? new Pool({
  connectionString: databaseUrl,
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
}) : null;

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: allowedOrigin === "*" ? true : allowedOrigin.split(",").map(x => x.trim()) }));
app.use(express.json({ limit: "1mb" }));

const collections = new Set(["repairs", "customers", "inventory", "sales", "settings"]);
const loginAttempts = new Map();

function requireConfig(req, res, next) {
  if (!jwtSecret || !adminPassword) return res.status(503).json({ error: "Authentication is not configured. Set JWT_SECRET and JARVIS_ADMIN_PASSWORD." });
  if (!pool) return res.status(503).json({ error: "Database is not configured. Set DATABASE_URL." });
  next();
}
function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: "Authentication required." });
  }
}
function validCollection(name) {
  return collections.has(name);
}
async function ensureSchema() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS jarvis_records (
      id TEXT PRIMARY KEY,
      collection TEXT NOT NULL CHECK (collection IN ('repairs','customers','inventory','sales','settings')),
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE jarvis_records ALTER COLUMN id TYPE TEXT USING id::text;
    CREATE INDEX IF NOT EXISTS jarvis_records_collection_updated
      ON jarvis_records (collection, updated_at DESC);
  `);
}

app.get("/health", (_req, res) => res.json({ ok: true, service: "jarvis-shop-api", version: "0.1.0", databaseConfigured: Boolean(pool) }));
app.get("/api/health", (_req, res) => res.json({ ok: true, databaseConfigured: Boolean(pool), authConfigured: Boolean(jwtSecret && adminPassword) }));

app.post("/api/auth/login", (req, res) => {
  if (!jwtSecret || !adminPassword) return res.status(503).json({ error: "Set JWT_SECRET and JARVIS_ADMIN_PASSWORD in service environment." });
  const ip = req.ip || "unknown";
  const now = Date.now();
  const entry = loginAttempts.get(ip) || { count: 0, until: now + 10 * 60 * 1000 };
  if (entry.until < now) { entry.count = 0; entry.until = now + 10 * 60 * 1000; }
  if (entry.count >= 10) return res.status(429).json({ error: "Too many login attempts. Try again later." });
  entry.count++;
  loginAttempts.set(ip, entry);
  const supplied = String(req.body?.password || "");
  const a = Buffer.from(supplied);
  const b = Buffer.from(adminPassword);
  const matches = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!matches) return res.status(401).json({ error: "Incorrect password." });
  loginAttempts.delete(ip);
  const token = jwt.sign({ role: "owner" }, jwtSecret, { expiresIn: "12h", issuer: "jarvis-shop-os" });
  res.json({ token, expiresIn: 43200, user: { role: "owner" } });
});

app.use("/api", requireConfig);
app.use("/api", auth);

app.get("/api/:collection", async (req, res, next) => {
  try {
    const { collection } = req.params;
    if (!validCollection(collection)) return res.status(404).json({ error: "Unknown collection." });
    const { rows } = await pool.query(
      "SELECT id, data, created_at AS \"createdAt\", updated_at AS \"updatedAt\" FROM jarvis_records WHERE collection=$1 ORDER BY updated_at DESC LIMIT 500",
      [collection]
    );
    res.json(rows.map(r => ({ id: r.id, ...r.data, createdAt: r.createdAt, updatedAt: r.updatedAt })));
  } catch (e) { next(e); }
});

app.post("/api/:collection", async (req, res, next) => {
  try {
    const { collection } = req.params;
    if (!validCollection(collection)) return res.status(404).json({ error: "Unknown collection." });
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) return res.status(400).json({ error: "Expected a JSON object." });
    const id = String(req.body.id || crypto.randomUUID());
    const data = { ...req.body };
    delete data.id; delete data.createdAt; delete data.updatedAt;
    const { rows } = await pool.query(
      "INSERT INTO jarvis_records (id, collection, data) VALUES ($1,$2,$3::jsonb) RETURNING id, data, created_at AS \"createdAt\", updated_at AS \"updatedAt\"",
      [id, collection, JSON.stringify(data)]
    );
    res.status(201).json({ id: rows[0].id, ...rows[0].data, createdAt: rows[0].createdAt, updatedAt: rows[0].updatedAt });
  } catch (e) { next(e); }
});

app.put("/api/:collection", async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { collection } = req.params;
    if (!validCollection(collection)) return res.status(404).json({ error: "Unknown collection." });
    if (!Array.isArray(req.body)) return res.status(400).json({ error: "Expected an array of records." });
    if (req.body.length > 500) return res.status(413).json({ error: "Too many records." });
    await client.query("BEGIN");
    await client.query("DELETE FROM jarvis_records WHERE collection=$1", [collection]);
    for (const item of req.body) {
      if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error("Invalid record.");
      const id = String(item.id || crypto.randomUUID());
      const data = { ...item }; delete data.id; delete data.createdAt; delete data.updatedAt;
      await client.query("INSERT INTO jarvis_records (id, collection, data) VALUES ($1,$2,$3::jsonb)", [id, collection, JSON.stringify(data)]);
    }
    await client.query("COMMIT");
    res.json({ ok: true, count: req.body.length });
  } catch (e) {
    await client.query("ROLLBACK");
    next(e);
  } finally { client.release(); }
});

app.put("/api/:collection/:id", async (req, res, next) => {
  try {
    const { collection, id } = req.params;
    if (!validCollection(collection)) return res.status(404).json({ error: "Unknown collection." });
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) return res.status(400).json({ error: "Expected a JSON object." });
    const data = { ...req.body };
    delete data.id; delete data.createdAt; delete data.updatedAt;
    const { rows } = await pool.query(
      "UPDATE jarvis_records SET data=$3::jsonb, updated_at=NOW() WHERE collection=$1 AND id=$2 RETURNING id, data, created_at AS \"createdAt\", updated_at AS \"updatedAt\"",
      [collection, id, JSON.stringify(data)]
    );
    if (!rows.length) return res.status(404).json({ error: "Record not found." });
    res.json({ id: rows[0].id, ...rows[0].data, createdAt: rows[0].createdAt, updatedAt: rows[0].updatedAt });
  } catch (e) { next(e); }
});

app.delete("/api/:collection/:id", async (req, res, next) => {
  try {
    const { collection, id } = req.params;
    if (!validCollection(collection)) return res.status(404).json({ error: "Unknown collection." });
    const result = await pool.query("DELETE FROM jarvis_records WHERE collection=$1 AND id=$2", [collection, id]);
    if (!result.rowCount) return res.status(404).json({ error: "Record not found." });
    res.status(204).end();
  } catch (e) { next(e); }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

ensureSchema().then(() => {
  app.listen(port, "0.0.0.0", () => console.log(`JARVIS API listening on ${port}`));
}).catch(error => {
  console.error("Database initialization failed:", error);
  process.exit(1);
});
