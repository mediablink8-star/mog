// Database layer.

import { Pool } from "pg";
import { env } from "./config.js";
import { randomUUID } from "crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export type Row = Record<string, unknown>;

export interface QueryResult {
  rows: Row[];
  rowCount: number;
  command?: string;
}

export interface DbPool {
  query<T = Row>(text: string, params?: readonly unknown[]): Promise<QueryResult>;
  connect(): Promise<DbClient>;
  end(): Promise<void>;
}

export interface DbClient {
  query<T = Row>(text: string, params?: readonly unknown[]): Promise<QueryResult>;
  release(): void;
}

let pool: DbPool | null = null;

export function getPool(): DbPool {
  if (pool) return pool;
  if (env.DATABASE_URL) {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: env.DATABASE_SSL,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  } else {
    // In-memory Postgres for tests (same SQL dialect the product runs on).
    const mod = require("@electric-sql/pglite") as {
      Driver: { load: () => Promise<unknown>; close: () => Promise<void> };
    };
    const driver = mod.Driver.load() as {
      exec: (sql: string, params?: readonly unknown[]) => Promise<{ rows: Row[] }>;
      close: () => Promise<void>;
    };
    class TestClient implements DbClient {
      async query(text: string, params: readonly unknown[] = []): Promise<QueryResult> {
        const res = await driver.exec(text, params);
        return { rows: res.rows, rowCount: res.rows.length, command: "SELECT" };
      }
      release(): void {
        /* no op */
      }
    }
    class TestPool implements DbPool {
      async query(text: string, params: readonly unknown[] = []): Promise<QueryResult> {
        const res = await driver.exec(text, params);
        return { rows: res.rows, rowCount: res.rows.length, command: "SELECT" };
      }
      async connect(): Promise<DbClient> {
        return new TestClient();
      }
      async end(): Promise<void> {
        await driver.close();
      }
    }
    pool = new TestPool();
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

const SCHEMA_DIR = join(process.cwd(), "migrations");

export async function readMigrations(): Promise<{ filename: string; content: string }[]> {
  let { readdirSync } = await import("node:fs");
  const files = readdirSync(SCHEMA_DIR).filter((f) => f.endsWith(".sql"));
  files.sort();
  return files.map((f) => ({ filename: f, content: readFileSync(join(SCHEMA_DIR, f), "utf8") }));
}

export async function createUuid(): Promise<string> {
  return randomUUID();
}
