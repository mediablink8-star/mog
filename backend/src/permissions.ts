// Authorization: per-endpoint permission matrix + role helpers.
// Roles: owner (full), manager (operations), employee (limited operations).

export type Role = "owner" | "manager" | "employee";

export type Permission =
  | "customers:read"
  | "customers:write"
  | "repairs:read"
  | "repairs:write"
  | "repairs:status"
  | "products:read"
  | "products:write"
  | "inventory:write"
  | "sales:read"
  | "sales:write"
  | "expenses:read"
  | "expenses:write"
  | "reports:read"
  | "ai:read"
  | "ai:write"
  | "users:write"
  | "settings:read"
  | "settings:write"
  | "admin:read";

export const PERMISSIONS: Record<Permission, Role[]> = {
  "customers:read": ["owner", "manager", "employee"],
  "customers:write": ["owner", "manager"],
  "repairs:read": ["owner", "manager", "employee"],
  "repairs:write": ["owner", "manager", "employee"],
  "repairs:status": ["owner", "manager", "employee"],
  "products:read": ["owner", "manager", "employee"],
  "products:write": ["owner", "manager", "employee"],
  "inventory:write": ["owner", "manager", "employee"],
  "sales:read": ["owner", "manager", "employee"],
  "sales:write": ["owner", "manager", "employee"],
  "expenses:read": ["owner", "manager", "employee"],
  "expenses:write": ["owner", "manager"],
  "reports:read": ["owner", "manager", "employee"],
  "ai:read": ["owner", "manager", "employee"],
  "ai:write": ["owner"],
  "users:write": ["owner"],
  "settings:read": ["owner", "manager"],
  "settings:write": ["owner", "manager"],
  "admin:read": ["owner"],
};

export function allowedRoles(permission: Permission): Role[] {
  return PERMISSIONS[permission];
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return allowedRoles(permission).includes(role);
}

// Human readable names for UI reporting.
export const PERMISSION_LABELS: Record<Permission, string> = {
  "customers:read": "View customers",
  "customers:write": "Add / edit customers",
  "repairs:read": "View repairs",
  "repairs:write": "Create / edit repairs",
  "repairs:status": "Change repair status",
  "products:read": "View products",
  "products:write": "Add / edit products",
  "inventory:write": "Record stock movements",
  "sales:read": "View sales and reports",
  "sales:write": "Create sales and payments",
  "expenses:read": "View expenses",
  "expenses:write": "Add / edit expenses",
  "reports:read": "View reports",
  "ai:read": "Read shop data in AI chat",
  "ai:write": "Run AI actions",
  "users:write": "Manage users",
  "settings:read": "View settings",
  "settings:write": "Change settings",
  "admin:read": "Admin data access",
};
