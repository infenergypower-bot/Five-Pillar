import type { Permission, ScopedRecord } from "@/lib/authorization";
import { authorize } from "@/lib/authorization";
import type { AuthPrincipal } from "@/lib/auth";
import { ServiceError } from "./errors";

export function guard(principal: AuthPrincipal, permission: Permission, record?: ScopedRecord): void {
  try {
    authorize(principal, permission, record);
  } catch {
    throw new ServiceError("FORBIDDEN", "You do not have access to this operation", 403);
  }
}

export function assertOrganization(principal: AuthPrincipal, organizationId: string): void {
  if (principal.organizationId !== organizationId) throw new ServiceError("NOT_FOUND", "Record not found", 404);
}

export function money(value: { toString(): string } | number): string {
  return value.toString();
}

export function nextCursor<T extends { id: string }>(rows: T[], limit: number): { items: T[]; nextCursor: string | null } {
  return { items: rows, nextCursor: rows.length === limit ? rows.at(-1)!.id : null };
}

export const internalRoles = new Set(["SUPER_ADMIN", "OPERATIONS_MANAGER", "CREATIVE_DIRECTOR", "PRODUCER_EDITOR", "SALES_ACCOUNT", "FINANCE"]);
