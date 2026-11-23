// Tenant isolation: every business owns its rows. The API enforces the
// authenticated user's business_id on every mutation and read of
// user-owned tables. `businesses` itself is open to all authenticated users.

import type { Role } from "./permissions.js";
import type { JwtPayload } from "./auth.js";

export interface Business {
  id: string;
  name: string;
  location: string;
  timezone: string;
  currency: string;
  created_at: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  business_id: string;
  business: Business;
}

export function unauthorized(): { status: number; body: { error: string } } {
  return { status: 401, body: { error: "Authentication required." } };
}

export interface AuthContext {
  user: AuthenticatedUser;
}

export function userIsOwner(ctx: AuthContext): boolean {
  return ctx.user.role === "owner";
}

export function userHas(ctx: AuthContext, role: Role): boolean {
  return ctx.user.role === role;
}

export function userBusiness(ctx: AuthContext, businessId: string): boolean {
  return ctx.user.business_id === businessId;
}
