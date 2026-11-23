// Configuration: reads .env (if present) into process.env, validates required
// values and exposes them as a typed object.

import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv({ path: ".env" });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_SSL: z
    .string()
    .default("true")
    .transform((v) => v !== "false"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  ADMIN_PASSWORD: z.string().min(1, "ADMIN_PASSWORD is required"),
  CORS_ORIGIN: z.string().default("*"),
  PORT: z
    .string()
    .transform((v) => Number(v))
    .default("10000")
    .refine((n) => n > 0 && n < 65536, "PORT must be between 1 and 65535"),
  AI_PROVIDER: z
    .string()
    .default("off")
    .transform((v) => v.toLowerCase())
    .refine((v) => ["off", "openai", "anthropic", "google", "ollama", "bedrock", "openrouter"].includes(v)),
  AI_MODEL: z.string().default("gpt-4o-mini"),
  AI_API_KEY: z.string().default(""),
  AI_BASE_URL: z.string().default("https://api.openai.com/v1"),
  AI_MAX_TOKENS: z.string().default("4000"),
  AI_TEMPERATURE: z.string().default("0.2"),
  AI_TIMEOUT_MS: z.string().default("30000"),
});

export const env = envSchema.parse(process.env);

export const JWT_ISSUER = "jarvis-shop-os";
export const JWT_EXPIRES_IN = "12h";

export function requireEnv<T extends keyof typeof process.env>(key: T): string {
  const value = process.env[key];
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
