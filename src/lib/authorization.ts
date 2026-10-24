export const roles = [
  "SUPER_ADMIN",
  "OPERATIONS_MANAGER",
  "CREATIVE_DIRECTOR",
  "PRODUCER_EDITOR",
  "SALES_ACCOUNT",
  "FINANCE",
  "CLIENT",
  "EXTERNAL_COLLABORATOR",
] as const;

export type AppRole = (typeof roles)[number];
export type Permission =
  | "crm:read"
  | "crm:write"
  | "pricing:read-internal"
  | "pricing:approve"
  | "pricing:override"
  | "production:read"
  | "production:write"
  | "finance:read"
  | "finance:write"
  | "settings:write"
  | "portal:read";

const permissions: Record<AppRole, ReadonlySet<Permission>> = {
  SUPER_ADMIN: new Set<Permission>([
    "crm:read", "crm:write", "pricing:read-internal", "pricing:approve", "pricing:override",
    "production:read", "production:write", "finance:read", "finance:write", "settings:write", "portal:read",
  ]),
  OPERATIONS_MANAGER: new Set<Permission>(["crm:read", "crm:write", "pricing:read-internal", "pricing:approve", "production:read", "production:write", "portal:read"]),
  CREATIVE_DIRECTOR: new Set<Permission>(["crm:read", "production:read", "production:write", "portal:read"]),
  PRODUCER_EDITOR: new Set<Permission>(["production:read", "production:write", "portal:read"]),
  SALES_ACCOUNT: new Set<Permission>(["crm:read", "crm:write", "pricing:approve", "production:read", "portal:read"]),
  FINANCE: new Set<Permission>(["crm:read", "pricing:read-internal", "pricing:approve", "pricing:override", "finance:read", "finance:write", "portal:read"]),
  CLIENT: new Set<Permission>(["portal:read"]),
  EXTERNAL_COLLABORATOR: new Set<Permission>(["production:read"]),
};

export interface Principal {
  userId: string;
  organizationId: string;
  role: AppRole;
  clientId?: string;
  assignedProjectIds?: readonly string[];
}

export interface ScopedRecord {
  organizationId: string;
  clientId?: string | null;
  projectId?: string | null;
}

export function hasPermission(principal: Principal, permission: Permission): boolean {
  return permissions[principal.role].has(permission);
}

export function canAccessRecord(principal: Principal, record: ScopedRecord): boolean {
  if (principal.organizationId !== record.organizationId) return false;
  if (principal.role === "CLIENT") return Boolean(principal.clientId && record.clientId === principal.clientId);
  if (principal.role === "EXTERNAL_COLLABORATOR") {
    return Boolean(record.projectId && principal.assignedProjectIds?.includes(record.projectId));
  }
  return true;
}

export function authorize(principal: Principal, permission: Permission, record?: ScopedRecord): void {
  if (!hasPermission(principal, permission)) throw new Error("Forbidden");
  if (record && !canAccessRecord(principal, record)) throw new Error("Forbidden");
}
