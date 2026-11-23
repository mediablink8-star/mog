// Authentication: password hashing (bcryptjs) and signed JWTs (jose).
// Tokens carry: sub, email, name, role, business_id, iss, exp.

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "./permissions.js";

export const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: Role;
  business_id: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string[];
}

export const JWT_SECRET_BYTES = new TextEncoder().encode(process.env.JWT_SECRET || "");

export function signToken(payload: Omit<JwtPayload, "iat" | "exp" | "iss" | "aud">): string {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    ...payload,
    iat: now,
    exp: now + 12 * 60 * 60,
    iss: "jarvis-shop-os",
    aud: ["jarvis-shop-os"],
  })
    .setProtectedHeader({ alg: "HS256" })
    .sign(JWT_SECRET_BYTES);
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET_BYTES, {
    issuer: "jarvis-shop-os",
    audience: ["jarvis-shop-os"],
  });
  return payload as JwtPayload;
}
