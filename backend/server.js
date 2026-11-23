// JARVIS Shop OS API - main server.
// Express 5 + PostgreSQL. Tenant isolation enforced per business.
// Routes: /health, /api/auth/* (public), /api/users, /api/customers,
// /api/repairs, /api/products, /api/inventory, /api/sales, /api/expenses,
// /api/reports/*, /api/suppliers, /api/audit, /api/backup, /api/ai
// All protected endpoints require a valid JWT + business-level access.

import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { Pool } from "pg";
import { env } from "./src/config.js";
import { signToken, verifyToken, hashPassword, verifyPassword } from "./src/auth.js";
import { allowedRoles, hasPermission, PERMISSION_LABELS } from "./src/permissions.js";
import { getPool, readMigrations } from "./src/db.js";

const app = express();
const pool = getPool();
const port = env.PORT;
const logger = {
  info(msg) { console.log(`[api] ${msg}`); },
  warn(msg) { console.warn(`[api] ${msg}`); },
  error(msg, err) { console.error(`[api] ${msg}`, err ?? ""); },
};

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(",").map((s) => s.trim()),
}));
app.use(express.json({ limit: "1mb" }));

// Logging & error handler
app.use((req, _res, next) => {
  const start = Date.now();
  req.on("finish", () => logger.info(`${req.method} ${req.originalUrl ?? "/"} -> ${res.statusCode} (${Date.now() - start}ms)`));
  next();
});
app.use((err, _req, res, _next) => {
  if (err && typeof err === "object" && err.status) return res.status(err.status).json({ error: err.message });
  logger.error("Unhandled error", err);
  res.status(500).json({ error: "Internal server error." });
});

// Startup schema, seed default business
async function ensureStartup() {
  const migrations = await readMigrations();
  await pool.query("BEGIN");
  try {
    for (const m of migrations) await pool.query(m.content);
    await pool.query("COMMIT");
    logger.info(`Schema applied (${migrations.length} migrations).`);
  } catch (err) {
    await pool.query("ROLLBACK");
    logger.error("Schema migration failed", err);
    process.exit(1);
  }
  const businessCount = await pool.query("SELECT COUNT(*) AS n FROM businesses");
  if (Number(businessCount.rows[0]?.n) === 0) {
    await pool.query(
      `INSERT INTO businesses (name, location, timezone, currency)
       VALUES ('JARVIS Repair Shop', 'Patission 155, Athens', 'Europe/Athens', 'EUR')`
    );
    logger.info("Default business created.");
  }
  app.listen(port, "0.0.0.0", () => logger.info(`JARVIS API listening on http://0.0.0.0:${port}`));
}
ensureStartup().catch((err) => { logger.error("Startup failed", err); process.exit(1); });

// Helpers
async function queryOne(text, params) {
  const res = await pool.query(text, params);
  return res.rows[0];
}
async function queryAll(text, params) {
  const res = await pool.query(text, params);
  return res.rows;
}
function json(res, status, body) { return res.status(status).json(body); }
function badRequest(res, message) { return json(res, 400, { error }); }
function forbidden(res, message = "Forbidden.") { return json(res, 403, { error }); }
function notFound(res, message = "Not found.") { return json(res, 404, { error }); }
function conflict(res, message = "Conflict.") { return json(res, 409, { error }); }



function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return forbidden(res, "Authentication required.");
  verifyToken(token)
    .then((payload) => {
      req.user = { sub: payload.sub, business_id: payload.business_id };
      next();
    })
    .catch(() => forbidden(res, "Authentication required."));
}

function isAuth(req, res) {
  return !!req.user;
}

function permissionMiddleware(permission) {
  return (req, res, next) => {
    if (!req.user) return forbidden(res, "Authentication required.");
    if (!hasPermission(req.user.role, permission)) {
      return forbidden(res, `Role "${req.user.role}" cannot perform this action.`);
    }
    next();
  };
}

async function auditLog(action, entity, entityId, performer, ip, details = {}) {
  try {
    const businessId = await queryOne("SELECT business_id FROM users WHERE id=$1", [performer]);
    if (!businessId) return;
    await pool.query(
      "INSERT INTO audit_logs (business_id, action, entity, entity_id, performed_by, ip, details) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [businessId.business_id, action, entity, entityId, performer, ip, JSON.stringify(details)]
    );
  } catch {
    /* audit is best-effort */
  }
}

function toISODate(value) {
  if (value === null || value === undefined) return null;
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function validateStatus(value) {
  return ["Received", "Diagnosing", "Waiting for approval", "Waiting for parts", "In progress", "Ready for collection", "Completed", "Cancelled"].includes(String(value));
}

// ---------------------------------------------------------------------------
// 1) Health
// ---------------------------------------------------------------------------
app.get("/health", (_req, res) => {
  res.json({ ok, service: "jarvis-shop-api", version: "2.0.0" });
});

// ---------------------------------------------------------------------------
// 2) Authentication
// ---------------------------------------------------------------------------
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    const row = await pool.query(`SELECT * FROM users WHERE email = $1`, [String(email || "").toLowerCase()]);
    const user = row.rows[0];
    if (!user || !user.is_active) return badRequest(res, "Incorrect email or password.");
    const ok = await verifyPassword(String(password || ""), String(user.password_hash));
    if (!ok) return badRequest(res, "Incorrect email or password.");
    const token = signToken({
      sub, email, name,
      role, business_id,
    });
    json(res, 200, { token, expiresIn: 43200, user: { id, email, name, role, business_id } });
    await auditLog("login", "auth", user.id, user.id, req.ip ?? "", {});
  } catch (err) {
    logger.error("Login error", err);
    badRequest(res, "Invalid login request.");
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    if (!hasPermission(req.user.role, "users:write")) return forbidden(res, "Only owners can create accounts.");
    const { email, password, name, role } = req.body ?? {};
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(String(email || ""))) return badRequest(res, "Enter a valid email address.");
    if (String(password || "").length < 8) return badRequest(res, "Password must be at least 8 characters.");
    if (!String(name || "").trim()) return badRequest(res, "Name is required.");
    if (!["owner", "manager", "employee"].includes(String(role || ""))) return badRequest(res, "Invalid role.");
    const existing = await pool.query(`SELECT id FROM users WHERE email=$1 OR name=$2`, [String(email).toLowerCase(), String(name || "")]);
    if (existing.rows.length) return conflict(res, "An account with this email or name already exists.");
    const hash = await hashPassword(String(password));
    const ins = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, business_id, is_active)
       VALUES ($1,$2,$3,$4,(SELECT business_id FROM users LIMIT 1),true) RETURNING id, email, name, role, created_at`,
      [String(email).toLowerCase(), hash, String(name), role]
    );
    json(res, 201, { id: rows[0].id, email: rows[0].email, name: rows[0].name, role: rows[0].role, created_at: rows[0].created_at });
    await auditLog("user_created", "users", ins.rows[0].id, req.user.sub, req.ip ?? "", { role });
  } catch (err) {
    logger.error("Register error", err);
    badRequest(res, "Could not create account.");
  }
});

app.post("/api/auth/change-password", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const { current, new_password } = req.body ?? {};
    const u = await pool.query(`SELECT password_hash FROM users WHERE id=$1`, [req.user.sub]);
    if (!u.rows[0]) return notFound(res);
    const ok = await verifyPassword(String(current || ""), String(u.rows[0].password_hash));
    if (!ok) return badRequest(res, "Current password is incorrect.");
    if (String(new_password || "").length < 8) return badRequest(res, "New password must be at least 8 characters.");
    await pool.query(`UPDATE users SET password_hash=$1 WHERE id=$2`, [await hashPassword(String(newPassword)), req.user.sub]);
    json(res, 200, { ok, message: "Password changed." });
  } catch (err) {
    logger.error("Change password error", err);
    badRequest(res, "Could not change password.");
  }
});

app.get("/api/auth/me", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const u = await pool.query(`SELECT id, email, name, role, business_id, is_active, created_at FROM users WHERE id=$1`, [req.user.sub]);
    if (!u.rows[0]) return notFound(res, "User not found.");
    const business = await pool.query(`SELECT id, name, location, timezone, currency FROM businesses WHERE id=$1`, [u.rows[0].business_id]);
    json(res, 200, { user: user.rows[0], business: business.rows[0] });
  } catch (err) {
    logger.error("Me error", err);
    badRequest(res, "Could not load profile.");
  }
});

// ---------------------------------------------------------------------------
// 3) Users (admin)
// ---------------------------------------------------------------------------
app.get("/api/users", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    if (!hasPermission(req.user.role, "users:read")) return forbidden(res, "Permission required.");
    const rows = await pool.query(
      `SELECT id, email, name, role, business_id, is_active, created_at FROM users WHERE business_id=(SELECT business_id FROM users WHERE id=$1) ORDER BY created_at`,
      [req.user.sub]
    );
    json(res, 200, rows.rows);
  } catch (err) {
    logger.error("Users list error", err);
    badRequest(res, "Could not load users.");
  }
});

app.post("/api/users", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    if (!hasPermission(req.user.role, "users:write")) return forbidden(res, "Only owners can create accounts.");
    const { email, password, name, role } = req.body ?? {};
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(String(email || ""))) return badRequest(res, "Enter a valid email address.");
    if (String(password || "").length < 8) return badRequest(res, "Password must be at least 8 characters.");
    if (!String(name || "").trim()) return badRequest(res, "Name is required.");
    if (!["owner", "manager", "employee"].includes(String(role || ""))) return badRequest(res, "Invalid role.");
    const existing = await pool.query(`SELECT id FROM users WHERE email=$1 OR name=$2`, [String(email).toLowerCase(), String(name || "")]);
    if (existing.rows.length) return conflict(res, "An account with this email or name already exists.");
    const hash = await hashPassword(String(password));
    const ins = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, business_id, is_active)
       VALUES ($1,$2,$3,$4,(SELECT business_id FROM users LIMIT 1),true) RETURNING id, email, name, role, created_at`,
      [String(email).toLowerCase(), hash, String(name), role]
    );
    json(res, 201, { id: rows[0].id, email: rows[0].email, name: rows[0].name, role: rows[0].role, created_at: rows[0].created_at });
    await auditLog("user_created", "users", ins.rows[0].id, req.user.sub, req.ip ?? "", { role });
  } catch (err) {
    logger.error("Create user error", err);
    badRequest(res, "Could not create account.");
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    if (!hasPermission(req.user.role, "users:write")) return forbidden(res, "Only owners can manage users.");
    const { name, email, role, isActive } = req.body ?? {};
    const target = await pool.query(`SELECT * FROM users WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
    if (!target.rows.length) return notFound(res);
    if (target.rows[0].id === req.user.sub && String(role || "").trim() && String(role) !== String(target.rows[0].role)) {
      return badRequest(res, "You cannot change your own role.");
    }
    const sets = [];
    const vals = [];
    if (name !== undefined) { sets.push("name=$1"); vals.push(String(name)); }
    if (email !== undefined) { sets.push("email=$2"); vals.push(String(email).toLowerCase()); }
    if (role !== undefined) { sets.push("role=$3"); vals.push(role); }
    if (isActive !== undefined) { sets.push("is_active=$4"); vals.push(Boolean(isActive)); }
    if (sets.length === 0) return badRequest(res, "No fields to update.");
    vals.push(target.rows[0].id);
    const row = await pool.query(`UPDATE users SET ${sets.join(", ")} WHERE id=${(vals.length)} RETURNING id, email, name, role, business_id, is_active, created_at`, vals);
    json(res, 200, row.rows[0]);
    await auditLog("user_updated", "users", target.rows[0].id, req.user.sub, req.ip ?? "", { changes: { name, email, role, is_active } });
  } catch (err) {
    logger.error("Update user error", err);
    badRequest(res, "Could not update account.");
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    if (!hasPermission(req.user.role, "users:write")) return forbidden(res, "Only owners can delete accounts.");
    const target = await pool.query(`SELECT * FROM users WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
    if (!target.rows.length) return notFound(res);
    if (target.rows[0].id === req.user.sub) return badRequest(res, "You cannot delete your own account.");
    await pool.query(`DELETE FROM users WHERE id=$1`, [req.params.id]);
    json(res, 204, { ok });
    await auditLog("user_deleted", "users", target.rows[0].id, req.user.sub, req.ip ?? "", {});
  } catch (err) {
    logger.error("Delete user error", err);
    badRequest(res, "Could not delete account.");
  }
});

// ---------------------------------------------------------------------------
// 4) Customers
// ---------------------------------------------------------------------------
app.get("/api/customers", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const { search, q } = req.query;
    const vals = [req.user.sub];
    let sql = `SELECT c.*, (SELECT COALESCE(SUM(pay.amount),0) FROM payments pay WHERE pay.sale_id IS NOT NULL) AS pos_paid_total
               FROM customers c WHERE c.business_id=(SELECT business_id FROM users WHERE id=$1)`;
    const arr = [];
    if (search || q) {
      const qstr = String(search ?? q ?? "");
      arr.push(`(c.first_name || ' ' || c.last_name ILIKE '%' || $2 || '%' OR c.phone ILIKE '%' || $2 || '%' OR c.email ILIKE '%' || $2 || '%')`);
      vals.push(qstr);
    }
    if (arr.length) sql += ` AND ${arr.join(" OR ")}`;
    sql += ` ORDER BY c.created_at DESC LIMIT 500`;
    const rows = await pool.query(sql, vals);
    json(res, 200, rows.rows.map(r => ({ ...r, full_name: `${r.first_name} ${r.last_name}`.trim() })));
  } catch (err) {
    logger.error("Customers list error", err);
    badRequest(res, "Could not load customers.");
  }
});

app.post("/api/customers", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const { first_name, last_name, phone, email, notes } = req.body ?? {};
    if (!String(first_name || "").trim()) return badRequest(res, "First name is required.");
    if (!String(last_name || "").trim()) return badRequest(res, "Last name is required.");
    if (!String(phone || "").trim()) return badRequest(res, "Phone number is required.");
    const dup = await pool.query(`SELECT id FROM customers WHERE business_id=(SELECT business_id FROM users WHERE id=$1) AND phone=$2`, [req.user.sub, String(phone).trim()]);
    if (dup.rows.length) return conflict(res, "A customer with this phone number already exists. Merge if needed.");
    const ins = await pool.query(
      `INSERT INTO customers (first_name, last_name, phone, email, notes, business_id)
       VALUES ($1,$2,$3,$4,$5,(SELECT business_id FROM users WHERE id=$6)) RETURNING *`,
      [String(first_name), String(last_name), String(phone), String(email || ""), String(notes || ""), req.user.sub]
    );
    const c = ins.rows[0];
    json(res, 201, { id: c.id, full_name: `${c.first_name} ${c.last_name}`, phone: c.phone, email: c.email, notes: c.notes, outstanding_balance: 0, created_at: c.created_at });
    await auditLog("customer_created", "customers", c.id, req.user.sub, req.ip ?? "", { first_name, last_name, phone });
  } catch (err) {
    logger.error("Create customer error", err);
    badRequest(res, "Could not create customer.");
  }
});

app.get("/api/customers/:id", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const c = await pool.query(`SELECT * FROM customers WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
    if (!c.rows.length) return notFound(res);
    const rep = await pool.query(`SELECT COUNT(*) AS n FROM repairs WHERE customer_id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [c.rows[0].id, req.user.sub]);
    const sal = await pool.query(`SELECT COALESCE(SUM(total),0) AS total, COUNT(*) AS n FROM sales WHERE customer_id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [c.rows[0].id, req.user.sub]);
    const paid = await pool.query(`SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE sale_id IN (SELECT id FROM sales WHERE customer_id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2))`, [c.rows[0].id, req.user.sub]);
    json(res, 200, {
  ...c.rows[0],
  full_name: `${c.rows[0].first_name} ${c.rows[0].last_name}`,
  repairs_count: rep.rows[0].n,
  sales_total: sal.rows[0].total,
  sales_count: sal.rows[0].n,
  payments_total: paid.rows[0].total,
  outstanding_balance: c.rows[0].outstanding_balance,
});
  } catch (err) {
    logger.error("Customer detail error", err);
    badRequest(res, "Could not load customer.");
  }
});

app.put("/api/customers/:id", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const { first_name, last_name, phone, email, notes } = req.body ?? {};
    const target = await pool.query(`SELECT * FROM customers WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
    if (!target.rows.length) return notFound(res);
    if (phone !== undefined) {
      const dup = await pool.query(`SELECT id FROM customers WHERE business_id=(SELECT business_id FROM users WHERE id=$1) AND phone=$2 AND id<>$3`, [req.user.sub, String(phone), target.rows[0].id]);
      if (dup.rows.length) return conflict(res, "A customer with this phone number already exists.");
    }
    const sets = [];
    const vals = [];
    if (first_name !== undefined) { sets.push("first_name=$1"); vals.push(String(first_name)); }
    if (last_name !== undefined) { sets.push("last_name=$2"); vals.push(String(last_name)); }
    if (phone !== undefined) { sets.push("phone=$3"); vals.push(String(phone)); }
    if (email !== undefined) { sets.push("email=$4"); vals.push(String(email || "")); }
    if (notes !== undefined) { sets.push("notes=$5"); vals.push(String(notes || "")); }
    if (sets.length === 0) return badRequest(res, "No fields to update.");
    vals.push(target.rows[0].id);
    const ins = await pool.query(`UPDATE customers SET ${sets.join(", ")} WHERE id=${(vals.length)} RETURNING *`, vals);
    await auditLog("customer_updated", "customers", target.rows[0].id, req.user.sub, req.ip ?? "", { changes: { first_name, last_name, phone, email, notes } });
    json(res, 200, { ...ins.rows[0], full_name: `${ins.rows[0].first_name} ${ins.rows[0].last_name}`.trim() });
  } catch (err) {
    logger.error("Update customer error", err);
    badRequest(res, "Could not update customer.");
  }
});

app.delete("/api/customers/:id", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    if (!hasPermission(req.user.role, "customers:write")) return forbidden(res, "Permission required.");
    const target = await pool.query(`SELECT * FROM customers WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
    if (!target.rows.length) return notFound(res);
    const hasHistory = await pool.query(`SELECT 1 FROM repairs WHERE customer_id=$1 LIMIT 1`, [req.params.id]);
    const hasSales = await pool.query(`SELECT 1 FROM sales WHERE customer_id=$1 LIMIT 1`, [req.params.id]);
    if (hasHistory.rows.length || hasSales.rows.length) {
      return conflict(res, "Customer has repair/sales history. Owners can disable the account instead of deleting it.");
    }
    await pool.query(`DELETE FROM customers WHERE id=$1`, [req.params.id]);
    json(res, 204, { ok });
    await auditLog("customer_deleted", "customers", target.rows[0].id, req.user.sub, req.ip ?? "", {});
  } catch (err) {
    logger.error("Delete customer error", err);
    badRequest(res, "Could not delete customer.");
  }
});

// ---------------------------------------------------------------------------
// 5) Repair tickets
// ---------------------------------------------------------------------------
app.get("/api/repairs", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const { search, status, limit = "500", offset = "0" } = req.query;
    const vals = [req.user.sub];
    let sql = `SELECT r.*, c.first_name AS customer_first_name, c.last_name AS customer_last_name, c.phone AS customer_phone FROM repairs r LEFT JOIN customers c ON c.id=r.customer_id WHERE r.business_id=(SELECT business_id FROM users WHERE id=$1)`;
    const arr = [];
    if (status) { arr.push("r.status=$2"); vals.push(String(status)); }
    if (search) {
      const s = String(search);
      arr.push("r.ticket_number ILIKE '%' || $3 || '%' OR r.device_manufacturer || ' ' || r.device_model ILIKE '%' || $3 || '%' OR r.issue ILIKE '%' || $3 || '%'");
      vals.push(s);
    }
    if (arr.length) sql += ` AND ${arr.join(" OR ")}`;
    sql += ` ORDER BY CASE r.status WHEN 'Completed' THEN 1 ELSE 0 END, r.date_received DESC LIMIT $${vals.length + 1} OFFSET $${vals.length + 2}`;
    vals.push(Number(limit), Number(offset));
    const rows = await pool.query(sql, vals);
    json(res, 200, rows.rows.map(r => mapRepair(r)));
  } catch (err) {
    logger.error("Repairs list error", err);
    badRequest(res, "Could not load repairs.");
  }
});

app.post("/api/repairs", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const { customer_id, device_manufacturer, device_model, device_type, imei_serial, issue, physical_condition, accessories_received, est_price, quoted_date, technician, notes } = req.body ?? {};
    if (!String(device_manufacturer || "").trim()) return badRequest(res, "Device manufacturer is required.");
    if (!String(issue || "").trim()) return badRequest(res, "Reported problem is required.");
    const ticket = await nextTicketNumber(req.user.business_id);
    const ins = await pool.query(
      `INSERT INTO repairs (ticket_number, customer_id, device_manufacturer, device_model, device_type, imei_serial, issue, physical_condition, accessories_received, est_price, quoted_date, technician, notes, status, business_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'Received',$14) RETURNING *`,
      [ticket, customer_id ?? null, String(device_manufacturer), String(device_model), String(device_type), String(imei_serial), String(issue), String(physical_condition), String(accessories_received), Number(est_price ?? 0), toISODate(quoted_date), String(technician || ""), String(notes || ""), req.user.business_id]
    );
    await auditLog("repair_created", "repairs", ins.rows[0].id, req.user.sub, req.ip ?? "", { ticket });
    json(res, 201, mapRepair(ins.rows[0]));
  } catch (err) {
    logger.error("Create repair error", err);
    badRequest(res, "Could not create repair.");
  }
});

app.get("/api/repairs/:id", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const r = await pool.query(`SELECT * FROM repairs WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
    if (!r.rows.length) return notFound(res);
    const c = await pool.query(`SELECT id, first_name, last_name, phone, email FROM customers WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [r.rows[0].customer_id, req.user.sub]);
    json(res, 200, { ...mapRepair(r.rows[0]), customer: c.rows[0] ?? null });
  } catch (err) {
    logger.error("Repair detail error", err);
    badRequest(res, "Could not load repair.");
  }
});

app.put("/api/repairs/:id", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const target = await pool.query(`SELECT * FROM repairs WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
    if (!target.rows.length) return notFound(res);
    const sets = [];
    const vals = [];
    const scalarFields = ["device_manufacturer", "device_model", "device_type", "issue", "physical_condition", "accessories_received", "technician", "notes", "imei_serial"];
    for (const f of scalarFields) {
      if (req.body?.[f] !== undefined) {
        sets.push(`${f}=$${vals.length + 1}`);
        vals.push(typeof req.body[f] === "string" ? req.body[f] : String(req.body[f] ?? ""));
      }
    }
    if (req.body?.customer_id !== undefined) { sets.push("customer_id=$${vals.length + 1}"); vals.push(req.body.customer_id ?? null); }
    if (req.body?.est_price !== undefined) { sets.push("est_price=$${vals.length + 1}"); vals.push(Number(req.body.est_price)); }
    if (req.body?.quoted_date !== undefined) { sets.push("quoted_date=$${vals.length + 1}"); vals.push(toISODate(req.body.quoted_date)); }
    if (req.body?.labour_cost !== undefined) { sets.push("labour_cost=$${vals.length + 1}"); vals.push(Number(req.body.labour_cost)); }
    if (req.body?.final_price !== undefined) { sets.push("final_price=$${vals.length + 1}"); vals.push(Number(req.body.final_price)); }
    if (req.body?.status !== undefined) {
      if (!validateStatus(req.body.status)) return badRequest(res, "Invalid status.");
      sets.push("status=$${vals.length + 1}"); vals.push(req.body.status);
    }
    if (sets.length === 0) return badRequest(res, "No fields to update.");
    vals.push(target.rows[0].id, target.rows[0].business_id);
    const ins = await pool.query(`UPDATE repairs SET ${sets.join(", ")} WHERE id=${(vals.length - 1)} AND business_id=${(vals.length)} RETURNING *`, vals);
    const changed = {};
    if (req.body?.status !== undefined) { changed.from_status = target.rows[0].status; changed.to_status = req.body.status; }
    if (Object.keys(changed).length) await auditLog("repair_status_changed", "repairs", target.rows[0].id, req.user.sub, req.ip ?? "", changed);
    await auditLog("repair_updated", "repairs", target.rows[0].id, req.user.sub, req.ip ?? "", { changes: req.body });
    json(res, 200, mapRepair(ins.rows[0]));
  } catch (err) {
    logger.error("Update repair error", err);
    badRequest(res, "Could not update repair.");
  }
});

app.patch("/api/repairs/:id/status", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const { status } = req.body ?? {};
    if (!validateStatus(status)) return badRequest(res, "Invalid status.");
    const target = await pool.query(`SELECT * FROM repairs WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
    if (!target.rows.length) return notFound(res);
    if (target.rows[0].status === status) return json(res, 200, mapRepair(target.rows[0]));
    const ins = await pool.query(`UPDATE repairs SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`, [status, target.rows[0].id]);
    await auditLog("repair_status_changed", "repairs", target.rows[0].id, req.user.sub, req.ip ?? "", { from_status: target.rows[0].status, to_status });
    json(res, 200, mapRepair(ins.rows[0]));
  } catch (err) {
    logger.error("Status change error", err);
    badRequest(res, "Could not update status.");
  }
});


app.post("/api/repairs/:id/parts", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const { items } = req.body ?? {};
    if (!Array.isArray(items) || items.length === 0) return badRequest(res, "At least one part is required.");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const target = await client.query(`SELECT * FROM repairs WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
      if (!target.rows.length) { await client.query("ROLLBACK"); return notFound(res); }
      for (const item of items) {
        const pid = String(item.product_id);
        const qty = Number(item.qty);
        const rec = await client.query(`SELECT qty, cost FROM products WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2) FOR UPDATE`, [pid, req.user.sub]);
        if (!rec.rows.length) { await client.query("ROLLBACK"); return badRequest(res, `Product "${item.name}" not found.`); }
        const currentQty = Number(rec.rows[0].qty);
        const cost = Number(rec.rows[0].cost);
        if (qty <= 0) { await client.query("ROLLBACK"); return badRequest(res, `Quantity for "${item.name}" must be greater than zero.`); }
        if (currentQty - qty < 0 && !env.ALLOW_NEGATIVE_STOCK) { await client.query("ROLLBACK"); return res.status(409).json({ error: `Not enough stock for "${item.name}". Only ${currentQty} in stock.` }); }
        await client.query(`UPDATE products SET qty = qty - $1 WHERE id=$2`, [qty, pid]);
        await client.query(`INSERT INTO inventory_movements (product_id, business_id, movement_type, quantity, reason, performed_by) VALUES ($1,$2,'deduct',$3,'Used in repair #${target.rows[0].ticket_number}',$4)`, [qty, pid, req.user.business_id, req.user.name]);
        await client.query(`INSERT INTO repair_parts_used (repair_id, product_id, name, qty, unit_cost, line_total) VALUES ($1,$2,$3,$4,$5,$6)`, [req.params.id, pid, item.name, qty, cost, qty * cost]);
      }
      await client.query("COMMIT");
      await auditLog("repair_parts_used", "repair_parts_used", req.params.id, req.user.sub, req.ip ?? "", { items: items.map(i => ({ product_id: i.product_id, qty: Number(i.qty), name: i.name })) });
      json(res, 200, { ok: true, totalPartsCost: items.reduce((a, i) => a + Number(i.qty) * Number(i.unit_cost), 0) });
    } catch (err) {
      await client.query("ROLLBACK");
      logger.error("Parts commit error", err);
      badRequest(res, "Could not record parts.");
    } finally {
      client.release();
    }
  } catch (err) {
    logger.error("Parts error", err);
    badRequest(res, "Could not record parts.");
  }
});

app.post("/api/repairs/:id/labour", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const { amount } = req.body ?? {};
    if (Number.isNaN(Number(amount)) || Number(amount) < 0) return badRequest(res, "Amount must be zero or more.");
    const target = await pool.query(`SELECT * FROM repairs WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
    if (!target.rows.length) return notFound(res);
    const ins = await pool.query(`UPDATE repairs SET labour_cost=$1, updated_at=NOW() WHERE id=$2 RETURNING *`, [Number(amount), target.rows[0].id]);
    await auditLog("repair_labour_added", "repairs", target.rows[0].id, req.user.sub, req.ip ?? "", { amount: amount });
    json(res, 200, mapRepair(ins.rows[0]));
  } catch (err) {
    logger.error("Labour error", err);
    badRequest(res, "Could not record labour.");
  }
});

app.post("/api/repairs/:id/final-price", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const { price } = req.body ?? {};
    if (Number.isNaN(Number(price)) || Number(price) < 0) return badRequest(res, "Price must be zero or more.");
    const target = await pool.query(`SELECT * FROM repairs WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
    if (!target.rows.length) return notFound(res);
    const ins = await pool.query(`UPDATE repairs SET final_price=$1, updated_at=NOW() WHERE id=$2 RETURNING *`, [Number(price), target.rows[0].id]);
    await auditLog("repair_final_price_set", "repairs", target.rows[0].id, req.user.sub, req.ip ?? "", { price: Number(price) });
    json(res, 200, mapRepair(ins.rows[0]));
  } catch (err) {
    logger.error("Final price error", err);
    badRequest(res, "Could not set final price.");
  }
});

app.post("/api/repairs/:id/payments", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const { method, amount } = req.body ?? {};
    if (!["cash", "card", "transfer", "other"].includes(String(method || ""))) return badRequest(res, "Invalid payment method.");
    if (Number.isNaN(Number(amount)) || Number(amount) <= 0) return badRequest(res, "Amount must be greater than zero.");
    const target = await pool.query(`SELECT * FROM repairs WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
    if (!target.rows.length) return notFound(res);
    const ins = await pool.query(`INSERT INTO payments (sale_id, repair_id, method, amount) VALUES (NULL, $1, $2, $3) RETURNING *`, [target.rows[0].id, method, Number(amount)]);
    json(res, 201, { id: rows[0].id, method, amount, created_at: rows[0].created_at });
    await auditLog("repair_payment_recorded", "payments", ins.rows[0].id, req.user.sub, req.ip ?? "", { method, amount });
  } catch (err) {
    logger.error("Payment error", err);
    badRequest(res, "Could not record payment.");
  }
});

app.get("/api/repairs/:id/history", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const target = await pool.query(`SELECT * FROM repairs WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
    if (!target.rows.length) return notFound(res);
    const sql = `SELECT 'status' AS entry_type, from_status, to_status, changed_by, changed_at AS entry_at FROM repair_status_history WHERE repair_id=$1
                 UNION ALL
                 SELECT 'note' AS entry_type, '' AS from_status, note, author, created_at FROM repair_notes WHERE repair_id=$1
                 UNION ALL
                 SELECT 'diagnosis' AS entry_type, '' AS from_status, diagnosis, author, created_at FROM repair_diagnosis WHERE repair_id=$1
                 UNION ALL
                 SELECT 'parts' AS entry_type, '' AS from_status, (name || ' x' || qty)::text, '' , created_at FROM repair_parts_used WHERE repair_id=$1
                 UNION ALL
                 SELECT 'labour' AS entry_type, '' AS from_status, ('Labour $'::text || labour_cost::text), author, created_at FROM repairs WHERE id=$1
                 UNION ALL
                 SELECT 'price' AS entry_type, '' AS from_status, ('Final price set to $'::text || final_price::text), '' , created_at FROM repairs WHERE id=$1
                 UNION ALL
                 SELECT 'payment' AS entry_type, '' AS from_status, (method || ' $'::text || amount::text), author, created_at FROM payments WHERE repair_id=$1
                 ORDER BY entry_at DESC LIMIT 200`;
    const rows = await pool.query(sql, [req.params.id]);
    json(res, 200, rows.rows);
  } catch (err) {
    logger.error("Repair history error", err);
    badRequest(res, "Could not load history.");
  }
});

app.get("/api/repairs/:id/parts-used", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const target = await pool.query(`SELECT * FROM repairs WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
    if (!target.rows.length) return notFound(res);
    const rows = await pool.query(`SELECT id, product_id, name, qty, unit_cost, line_total, created_at FROM repair_parts_used WHERE repair_id=$1 ORDER BY created_at`, [req.params.id]);
    json(res, 200, rows.rows);
  } catch (err) {
    logger.error("Parts used error", err);
    badRequest(res, "Could not load parts.");
  }
});

app.post("/api/repairs/:id/notes", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const { note } = req.body ?? {};
    if (!String(note || "").trim()) return badRequest(res, "Note text is required.");
    const target = await pool.query(`SELECT * FROM repairs WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
    if (!target.rows.length) return notFound(res);
    const ins = await pool.query(`INSERT INTO repair_notes (repair_id, author, note) VALUES ($1,$2,$3) RETURNING *`, [req.params.id, req.user.name, String(note)]);
    await auditLog("repair_note_added", "repair_notes", ins.rows[0].id, req.user.sub, req.ip ?? "", { note: String(note || "").slice(0, 200) });
    json(res, 201, ins.rows[0]);
  } catch (err) {
    logger.error("Add note error", err);
    badRequest(res, "Could not add note.");
  }
});

app.post("/api/repairs/:id/diagnosis", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const { diagnosis } = req.body ?? {};
    if (!String(diagnosis || "").trim()) return badRequest(res, "Diagnosis text is required.");
    const target = await pool.query(`SELECT * FROM repairs WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
    if (!target.rows.length) return notFound(res);
    const ins = await pool.query(`INSERT INTO repair_diagnosis (repair_id, author, diagnosis) VALUES ($1,$2,$3) RETURNING *`, [req.params.id, req.user.name, String(diagnosis)]);
    await auditLog("repair_diagnosis_added", "repair_diagnosis", ins.rows[0].id, req.user.sub, req.ip ?? "", {});
    json(res, 201, ins.rows[0]);
  } catch (err) {
    logger.error("Movements list error", err);
    badRequest(res, "Could not load movements.");
  }
});

// ---------------------------------------------------------------------------// 6) Products and Inventory
// ---------------------------------------------------------------------------
app.get("/api/products", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const { search, q, category, low } = req.query;
    const vals = [req.user.sub];
    let sql = `SELECT p.*, s.name AS supplier_name FROM products p
               LEFT JOIN suppliers s ON s.id = p.supplier_id
               WHERE p.business_id=(SELECT business_id FROM users WHERE id=$1)`;
    const arr = [];
    if (search || q) {
      const qstr = String(search ?? q ?? "");
      arr.push(`p.name ILIKE '%' || $2 || '%' OR p.sku ILIKE '%' || $2 || '%' OR p.barcode ILIKE '%' || $2 || '%'`);
      vals.push(qstr);
    }
    if (category) { arr.push("p.category=$1"); vals.push(String(category)); }
    if (low === "true") { arr.push("p.qty <= p.min_qty"); }
    if (arr.length) sql += ` AND ${arr.join(" AND ")}`;
    sql += ` ORDER BY p.created_at DESC LIMIT 500`;
    const rows = await pool.query(sql, vals);
    json(res, 200, rows.rows);
  } catch (err) {
    logger.error("Products list error", err);
    badRequest(res, "Could not load products.");
  }
});

app.post("/api/products", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const { name, sku, barcode, category, brand, supplier_id, cost, price, qty, min_qty, location } = req.body ?? {};
    if (!String(name || "").trim()) return badRequest(res, "Product name is required.");
    if (!String(sku || "").trim()) return badRequest(res, "SKU is required.");
    if (Number.isNaN(Number(cost)) || Number(cost) < 0) return badRequest(res, "Cost must be zero or more.");
    if (Number.isNaN(Number(price)) || Number(price) < 0) return badRequest(res, "Selling price must be zero or more.");
    const dup = await pool.query(`SELECT id FROM products WHERE business_id=(SELECT business_id FROM users WHERE id=$1) AND sku=$2`, [req.user.sub, String(sku).trim()]);
    if (dup.rows.length) return conflict(res, "A product with this SKU already exists.");
    const ins = await pool.query(
      `INSERT INTO products (name, sku, barcode, category, brand, supplier_id, cost, price, qty, min_qty, location, business_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,(SELECT business_id FROM users WHERE id=$11)) RETURNING *`,
      [String(name), String(sku), String(barcode || ""), String(category || "Other accessories"), String(brand || ""), supplier_id ?? null, Number(cost), Number(price), Number(qty ?? 0), Number(min_qty ?? 5), String(location || ""), req.user.sub]
    );
    json(res, 201, ins.rows[0]);
    await auditLog("product_created", "products", ins.rows[0].id, req.user.sub, req.ip ?? "", {});
  } catch (err) {
    logger.error("Create product error", err);
    badRequest(res, "Could not create product.");
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const p = await pool.query(`SELECT * FROM products WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
    if (!p.rows.length) return notFound(res);
    json(res, 200, p.rows[0]);
  } catch (err) {
    logger.error("Product detail error", err);
    badRequest(res, "Could not load product.");
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const target = await pool.query(`SELECT * FROM products WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
    if (!target.rows.length) return notFound(res);
    const { name, sku, barcode, category, brand, supplier_id, cost, price, qty, min_qty, location } = req.body ?? {};
    const sets = [];
    const vals = [];
    if (name !== undefined) { sets.push("name=$1"); vals.push(String(name)); }
    if (sku !== undefined) { sets.push("sku=$2"); vals.push(String(sku)); }
    if (barcode !== undefined) { sets.push("barcode=$3"); vals.push(String(barcode || "")); }
    if (category !== undefined) { sets.push("category=$4"); vals.push(String(category)); }
    if (brand !== undefined) { sets.push("brand=$5"); vals.push(String(brand || "")); }
    if (supplier_id !== undefined) { sets.push("supplier_id=$6"); vals.push(supplier_id ?? null); }
    if (cost !== undefined) { sets.push("cost=$7"); vals.push(Number(cost)); }
    if (price !== undefined) { sets.push("price=$8"); vals.push(Number(price)); }
    if (qty !== undefined) { sets.push("qty=$9"); vals.push(Number(qty)); }
    if (min_qty !== undefined) { sets.push("min_qty=$10"); vals.push(Number(min_qty)); }
    if (location !== undefined) { sets.push("location=$11"); vals.push(String(location || "")); }
    if (sets.length === 0) return badRequest(res, "No fields to update.");
    vals.push(target.rows[0].id, target.rows[0].business_id);
    const ins = await pool.query(`UPDATE products SET ${sets.join(", ")} WHERE id=${(vals.length - 1)} AND business_id=${(vals.length)} RETURNING *`, vals);
    json(res, 200, ins.rows[0]);
    await auditLog("product_updated", "products", target.rows[0].id, req.user.sub, req.ip ?? "", { changes: req.body });
  } catch (err) {
    logger.error("Update product error", err);
    badRequest(res, "Could not update product.");
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    if (!hasPermission(req.user.role, "products:write")) return forbidden(res, "Permission required.");
    const target = await pool.query(`SELECT * FROM products WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
    if (!target.rows.length) return notFound(res);
    await pool.query(`DELETE FROM products WHERE id=$1`, [req.params.id]);
    json(res, 204, { ok });
    await auditLog("product_deleted", "products", target.rows[0].id, req.user.sub, req.ip ?? "", {});
  } catch (err) {
    logger.error("Delete product error", err);
    badRequest(res, "Could not delete product.");
  }
});

// Inventory stock actions (require inventory:write permission)
app.post("/api/inventory/purchases", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    if (!hasPermission(req.user.role, "inventory:write")) return forbidden(res, "Permission required.");
    const { items, performed_by } = req.body ?? {};
    if (!Array.isArray(items) || items.length === 0) return badRequest(res, "At least one purchase line is required.");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const recs = await client.query(`SELECT id, qty, cost FROM products WHERE business_id=(SELECT business_id FROM users WHERE id=$1) AND id = ANY($2::uuid[])`, [req.user.sub, items.map(i => i.product_id)]);
      for (const item of items) {
        const pid = String(item.product_id);
        const qty = Number(item.qty);
        const rec = recs.rows.find(r => r.id === pid);
        if (!rec) return badRequest(res, `Product "${item.name || pid}" not found.`);
        if (qty <= 0) return badRequest(res, `Quantity for "${item.name || pid}" must be greater than zero.`);
        await client.query(`UPDATE products SET qty = qty + $1 WHERE id=$2`, [qty, pid]);
        await client.query(`INSERT INTO inventory_movements (product_id, business_id, movement_type, quantity, reason, performed_by) VALUES ($1,$2,'purchase',$3,'Restock',COALESCE($4,$5))`, [pid, req.user.business_id, qty, performed_by ?? req.user.name, performed_by]);
      }
      await client.query("COMMIT");
      json(res, 200, { ok: true, count: count.length });
      await auditLog("stock_purchased", "inventory_movements", "", req.user.sub, req.ip ?? "", { items: items.map(i => ({ product_id: i.product_id, qty: Number(i.qty) })) });
    } catch (err) {
      await client.query("ROLLBACK");
      badRequest(res, "Could not record purchase.");
    } finally {
      client.release();
    }
  } catch (err) {
    badRequest(res, "Could not record purchase.");
  }
});


app.post("/api/inventory/stock-movements", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    if (!hasPermission(req.user.role, "inventory:write")) return forbidden(res, "Permission required.");
    const { items, performed_by } = req.body ?? {};
    if (!Array.isArray(items) || items.length === 0) return badRequest(res, "At least one movement line is required.");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const recs = await client.query(`SELECT id, qty FROM products WHERE business_id=(SELECT business_id FROM users WHERE id=$1) AND id = ANY($2::uuid[])`, [req.user.sub, items.map(i => i.product_id)]);
      for (const item of items) {
        const pid = String(item.product_id);
        const qty = Number(item.quantity);
        const rec = recs.rows.find(r => r.id === pid);
        if (!rec) return badRequest(res, `Product "${pid}" not found.`);
        if (item.movement_type === "deduct" && qty <= 0) return badRequest(res, "Deduction quantity must be greater than zero.");
        if (item.movement_type === "adjust" && Math.abs(qty) < 1) return badRequest(res, "Adjustment quantity must be at least 1 unit.");
        const currentQty = Number(rec.qty);
        let newQty;
        if (item.movement_type === "deduct") {
          if (currentQty - qty < 0 && !env.ALLOW_NEGATIVE_STOCK) return res.status(409).json({ error: `Not enough stock for product "${pid}". Only ${currentQty} in stock.` });
          newQty = currentQty - qty;
        } else {
          newQty = currentQty + qty;
        }
        await client.query(`UPDATE products SET qty = $1 WHERE id=$2`, [newQty, pid]);
        await client.query(`INSERT INTO inventory_movements (product_id, business_id, movement_type, quantity, reason, performed_by) VALUES ($1,$2,$3,$4,'$5',COALESCE($6,$7))`, [pid, req.user.business_id, item.movement_type, qty, item.reason, performed_by ?? req.user.name, performed_by]);
      }
      await client.query("COMMIT");
      json(res, 200, { ok: true, count: count.length });
      await auditLog("stock_adjusted", "inventory_movements", "", req.user.sub, req.ip ?? "", { items: items.map(i => ({ product_id: i.product_id, movement_type: i.movement_type, qty: Number(i.quantity) })) });
    } catch (err) {
      await client.query("ROLLBACK");
      badRequest(res, "Could not apply movements.");
    } finally {
      client.release();
    }
  } catch (err) {
    badRequest(res, "Could not apply movements.");
  }
});

app.get("/api/inventory/valuation", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const rows = await pool.query(`SELECT category, SUM(qty * cost) AS value, SUM(qty) AS units FROM products WHERE business_id=(SELECT business_id FROM users WHERE id=$1) GROUP BY category`, [req.user.sub]);
    const total = await pool.query(`SELECT COALESCE(SUM(qty * cost),0) AS val, COALESCE(SUM(qty),0) AS units FROM products WHERE business_id=(SELECT business_id FROM users WHERE id=$1)`, [req.user.sub]);
    json(res, 200, { categories: rows.rows, total: total.rows[0].val, units: total.rows[0].units });
  } catch (err) {
    logger.error("Valuation error", err);
    badRequest(res, "Could not load valuation.");
  }
});

app.get("/api/inventory/movements", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const { product_id, from, to } = req.query;
    let sql = `SELECT m.*, p.name AS product_name FROM inventory_movements m JOIN products p ON p.id=m.product_id WHERE m.business_id=(SELECT business_id FROM users WHERE id=$1)`;
    const vals = [req.user.sub];
    const arr = [];
    if (product_id) { arr.push("m.product_id=$2"); vals.push(String(product_id)); }
    if (from) { arr.push("m.created_at>=$1"); vals.push(toISODate(from)); }
    if (to) { arr.push("m.created_at<=$1"); vals.push(toISODate(to) ?? new Date().toISOString()); }
    if (arr.length) sql += ` AND ${arr.join(" AND ")}`;
    sql += ` ORDER BY m.created_at DESC LIMIT 500`;
    const rows = await pool.query(sql, vals);
    json(res, 200, rows.rows);
  } catch (err) {
    logger.error("Movements list error", err);
    badRequest(res, "Could not load movements.");
  }
});

// ---------------------------------------------------------------------------// 7) Sales (point of sale)
// ---------------------------------------------------------------------------
app.post("/api/sales", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    if (!hasPermission(req.user.role, "sales:write")) return forbidden(res, "Permission required.");
    const { customer_id, items, payment_method = "cash", notes, sale_date } = req.body ?? {};
    if (!Array.isArray(items) || items.length === 0) return badRequest(res, "At least one item is required.");
    const subtotal = items.reduce((a, i) => a + Number(i.qty) * Number(i.unit_price), 0);
    const discount = Number(req.body?.discount ?? 0);
    const total = Math.max(0, subtotal - discount);
    if (Number.isNaN(Number(total))) return badRequest(res, "Invalid total.");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const ins = await pool.query(
        `INSERT INTO sales (customer_id, invoice_no, subtotal, discount, total, payment_method, notes, sale_date, business_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,(SELECT business_id FROM users WHERE id=$9)) RETURNING *`,
        [customer_id ?? null, `INV-${String(req.user.business_id).slice(0, 6).toUpperCase()}-${new Date().toISOString().slice(0, 10)}-${String(Date.now()).slice(-6)}`, subtotal, discount, total, payment_method, String(notes || ""), toISODate(sale_date), req.user.sub]
      );
      const itemIds = [];
      for (const item of items) {
        const ii = await client.query(
          `INSERT INTO sale_items (sale_id, product_id, name, qty, unit_price, line_total)
           VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
          [ins.rows[0].id, item.product_id ?? null, item.name, Number(item.qty), Number(item.unit_price), Number(item.qty) * Number(item.unit_price)]
        );
        itemIds.push(ii.rows[0].id);
        if (item.product_id) {
          const prod = await client.query(`SELECT qty, cost FROM products WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2) FOR UPDATE`, [item.product_id, req.user.sub]);
          if (!prod.rows.length) { await client.query("ROLLBACK"); return badRequest(res, `Product "${item.name}" not found.`); }
          const currentQty = Number(prod.rows[0].qty);
          if (currentQty - Number(item.qty) < 0 && !env.ALLOW_NEGATIVE_STOCK) { await client.query("ROLLBACK"); return res.status(409).json({ error: `Not enough stock for "${item.name}". Only ${currentQty} in stock.` }); }
          await client.query(`UPDATE products SET qty = qty - $1 WHERE id=$2`, [Number(item.qty), item.product_id]);
          await client.query(`INSERT INTO inventory_movements (product_id, business_id, movement_type, quantity, reason, performed_by) VALUES ($1,$2,'deduct',$3,'POS sale',$4)`, [item.product_id, req.user.business_id, Number(item.qty), req.user.name]);
        }
      }
      await client.query("COMMIT");
      json(res, 201, mapSale(ins.rows[0], itemIds));
      await auditLog("sale_created", "sales", ins.rows[0].id, req.user.sub, req.ip ?? "", { items: items.map(i => ({ product_id: i.product_id, qty: Number(i.qty), name: i.name, unit_price: Number(i.unit_price) })) });
    } catch (err) {
      await client.query("ROLLBACK");
      logger.error("Sale commit error", err);
      badRequest(res, "Could not record sale.");
    } finally {
      client.release();
    }
  } catch (err) {
    logger.error("Sale error", err);
    badRequest(res, "Could not record sale.");
  }
});

app.get("/api/sales", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const { customer_id, from, to } = req.query;
    let sql = `SELECT s.*, c.first_name AS customer_first_name, c.last_name AS customer_last_name FROM sales s
               LEFT JOIN customers c ON c.id = s.customer_id
               WHERE s.business_id=(SELECT business_id FROM users WHERE id=$1)`;
    const vals = [req.user.sub];
    const arr = [];
    if (customer_id) { arr.push("s.customer_id=$2"); vals.push(String(customer_id)); }
    if (from) { arr.push("s.sale_date>=$1"); vals.push(toISODate(from)); }
    if (to) { arr.push("s.sale_date<=$1"); vals.push(toISODate(to) ?? new Date().toISOString()); }
    if (arr.length) sql += ` AND ${arr.join(" AND ")}`;
    sql += ` ORDER BY s.sale_date DESC LIMIT 500`;
    const rows = await pool.query(sql, vals);
    json(res, 200, rows.rows.map(r => mapSale(r, [])));
  } catch (err) {
    logger.error("Sales list error", err);
    badRequest(res, "Could not load sales.");
  }
});

app.get("/api/sales/:id", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const s = await pool.query(`SELECT * FROM sales WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
    if (!s.rows.length) return notFound(res);
    const items = await pool.query(`SELECT si.*, p.name AS product_name FROM sale_items si LEFT JOIN products p ON p.id = si.product_id WHERE si.sale_id=$1`, [req.params.id]);
    json(res, 200, mapSale(s.rows[0], items.rows));
  } catch (err) {
    logger.error("Sale detail error", err);
    badRequest(res, "Could not load sale.");
  }
});

app.put("/api/sales/:id", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const target = await pool.query(`SELECT * FROM sales WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
    if (!target.rows.length) return notFound(res);
    const { customer_id, items, payment_method, notes, sale_date } = req.body ?? {};
    const subtotal = items.reduce((a, i) => a + Number(i.qty) * Number(i.unit_price), 0);
    const discount = Number(req.body?.discount ?? 0);
    const total = Math.max(0, subtotal - discount);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(`UPDATE sales SET customer_id=$1, payment_method=$2, notes=$3, sale_date=$4, subtotal=$5, discount=$6, total=$7, updated_at=NOW() WHERE id=$8`, [customer_id ?? null, payment_method ?? target.rows[0].payment_method, String(notes ?? ""), toISODate(sale_date), subtotal, discount, total, target.rows[0].id]);
      await client.query(`DELETE FROM sale_items WHERE sale_id=$1`, [target.rows[0].id]);
      const itemIds = [];
      for (const item of items) {
        const ii = await client.query(
          `INSERT INTO sale_items (sale_id, product_id, name, qty, unit_price, line_total)
           VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
          [target.rows[0].id, item.product_id ?? null, item.name, Number(item.qty), Number(item.unit_price), Number(item.qty) * Number(item.unit_price)]
        );
        itemIds.push(ii.rows[0].id);
        if (item.product_id) {
          const prod = await client.query(`SELECT qty FROM products WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2) FOR UPDATE`, [item.product_id, req.user.sub]);
          if (!prod.rows.length) { await client.query("ROLLBACK"); return badRequest(res, `Product "${item.name}" not found.`); }
          if (Number(prod.rows[0].qty) - Number(item.qty) < 0 && !env.ALLOW_NEGATIVE_STOCK) { await client.query("ROLLBACK"); return res.status(409).json({ error: `Not enough stock for "${item.name}".` }); }
          await client.query(`UPDATE products SET qty = qty - $1 WHERE id=$2`, [Number(item.qty), item.product_id]);
          await client.query(`INSERT INTO inventory_movements (product_id, business_id, movement_type, quantity, reason, performed_by) VALUES ($1,$2,'deduct',$3,'POS sale (edit)',$4)`, [item.product_id, req.user.business_id, Number(item.qty), req.user.name]);
        }
      }
      await client.query("COMMIT");
      json(res, 200, mapSale(target.rows[0], itemIds));
      await auditLog("sale_updated", "sales", target.rows[0].id, req.user.sub, req.ip ?? "", { items: items.map(i => ({ product_id: i.product_id, qty: Number(i.qty), name: i.name })), changes: req.body });
    } catch (err) {
      await client.query("ROLLBACK");
      badRequest(res, "Could not update sale.");
    } finally {
      client.release();
    }
  } catch (err) {
    logger.error("Sale update error", err);
    badRequest(res, "Could not update sale.");
  }
});

app.post("/api/sales/:id/payment", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    const { method, amount } = req.body ?? {};
    if (!["cash", "card", "transfer", "other"].includes(String(method || ""))) return badRequest(res, "Invalid payment method.");
    if (Number.isNaN(Number(amount)) || Number(amount) <= 0) return badRequest(res, "Amount must be greater than zero.");
    const target = await pool.query(`SELECT * FROM sales WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
    if (!target.rows.length) return notFound(res);
    const ins = await pool.query(`INSERT INTO payments (sale_id, method, amount) VALUES ($1,$2,$3) RETURNING *`, [target.rows[0].id, method, Number(amount)]);
    json(res, 201, { id: rows[0].id, method, amount, created_at: rows[0].created_at });
    await auditLog("sale_payment_recorded", "payments", ins.rows[0].id, req.user.sub, req.ip ?? "", { method, amount });
  } catch (err) {
    logger.error("Payment error", err);
    badRequest(res, "Could not record payment.");
  }
});

// ---------------------------------------------------------------------------
// 8) Expenses
// ---------------------------------------------------------------------------
app.get("/api/expenses", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    if (!hasPermission(req.user.role, "expenses:read")) return forbidden(res, "Permission required.");
    const { from, to } = req.query;
    let sql = `SELECT * FROM expenses WHERE business_id=(SELECT business_id FROM users WHERE id=$1)`;
    const vals = [req.user.sub];
    const arr = [];
    if (from) { arr.push("expense_date>=$1"); vals.push(toISODate(from)); }
    if (to) { arr.push("expense_date<=$1"); vals.push(toISODate(to) ?? new Date().toISOString()); }
    if (arr.length) sql += ` AND ${arr.join(" AND ")}`;
    sql += ` ORDER BY expense_date DESC, id DESC LIMIT 500`;
    const rows = await pool.query(sql, vals);
    json(res, 200, rows.rows);
  } catch (err) {
    logger.error("Expenses list error", err);
    badRequest(res, "Could not load expenses.");
  }
});

app.post("/api/expenses", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    if (!hasPermission(req.user.role, "expenses:write")) return forbidden(res, "Permission required.");
    const { description, category = "Other", amount, payment_method = "cash", expense_date, notes } = req.body ?? {};
    if (!String(description || "").trim()) return badRequest(res, "Description is required.");
    if (Number.isNaN(Number(amount)) || Number(amount) <= 0) return badRequest(res, "Amount must be greater than zero.");
    const ins = await pool.query(
      `INSERT INTO expenses (description, category, amount, payment_method, expense_date, notes, business_id)
       VALUES ($1,$2,$3,$4,$5,$6,(SELECT business_id FROM users WHERE id=$7)) RETURNING *`,
      [String(description), String(category), Number(amount), payment_method, toISODate(expense_date), String(notes || ""), req.user.sub]
    );
    json(res, 201, ins.rows[0]);
    await auditLog("expense_created", "expenses", ins.rows[0].id, req.user.sub, req.ip ?? "", { category, amount });
  } catch (err) {
    logger.error("Create expense error", err);
    badRequest(res, "Could not create expense.");
  }
});

app.put("/api/expenses/:id", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    if (!hasPermission(req.user.role, "expenses:write")) return forbidden(res, "Permission required.");
    const target = await pool.query(`SELECT * FROM expenses WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
    if (!target.rows.length) return notFound(res);
    const { description, category, amount, payment_method, expense_date, notes } = req.body ?? {};
    const sets = [];
    const vals = [];
    if (description !== undefined) { sets.push("description=$1"); vals.push(String(description)); }
    if (category !== undefined) { sets.push("category=$2"); vals.push(String(category)); }
    if (amount !== undefined) { sets.push("amount=$3"); vals.push(Number(amount)); }
    if (payment_method !== undefined) { sets.push("payment_method=$4"); vals.push(String(payment_method)); }
    if (expense_date !== undefined) { sets.push("expense_date=$5"); vals.push(toISODate(expense_date)); }
    if (notes !== undefined) { sets.push("notes=$6"); vals.push(String(notes || "")); }
    if (sets.length === 0) return badRequest(res, "No fields to update.");
    vals.push(target.rows[0].id);
    const ins = await pool.query(`UPDATE expenses SET ${sets.join(", ")} WHERE id=${(vals.length)} RETURNING *`, vals);
    json(res, 200, ins.rows[0]);
    await auditLog("expense_updated", "expenses", target.rows[0].id, req.user.sub, req.ip ?? "", { changes: req.body });
  } catch (err) {
    logger.error("Update expense error", err);
    badRequest(res, "Could not update expense.");
  }
});

app.delete("/api/expenses/:id", async (req, res) => {
  try {
    if (!isAuth(req, res)) return;
    if (!hasPermission(req.user.role, "expenses:write")) return forbidden(res, "Permission required.");
    const target = await pool.query(`SELECT * FROM expenses WHERE id=$1 AND business_id=(SELECT business_id FROM users WHERE id=$2)`, [req.params.id, req.user.sub]);
    if (!target.rows.length) return notFound(res);
    await pool.query(`DELETE FROM expenses WHERE id=$1`, [req.params.id]);
    json(res, 204, { ok });
    await auditLog("expense_deleted", "expenses", target.rows[0].id, req.user.sub, req.ip ?? "", {});
  } catch (err) {
    logger.error("Delete expense error", err);
    badRequest(res, "Could not delete expense.");
  }
});

