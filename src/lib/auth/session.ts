import { cookies } from "next/headers";
import type { Role } from "@prisma/client";
import type { Principal } from "@/lib/authorization";
import { db } from "@/lib/db";
import { demoModeEnabled } from "@/lib/demo-mode";
import { createOpaqueToken, hashOpaqueToken } from "./tokens";

export const SESSION_COOKIE = "__Host-five-pillar-session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface AuthPrincipal extends Principal {
  role: Role;
  sessionId: string;
  name: string;
  email: string;
}

async function getDemoPrincipal(): Promise<AuthPrincipal | null> {
  const demoUser = await db.user.findFirst({
    where: { organization: { slug: "five-pillar" }, role: "SUPER_ADMIN", active: true },
    orderBy: { createdAt: "asc" },
  });
  if (!demoUser) return null;
  const demoClient = await db.client.findFirst({
    where: { organizationId: demoUser.organizationId },
    orderBy: { id: "asc" },
    select: { id: true },
  });
  return {
    sessionId: "read-only-demo",
    userId: demoUser.id,
    organizationId: demoUser.organizationId,
    role: demoUser.role,
    name: "Demo workspace",
    email: demoUser.email,
    clientId: demoClient?.id,
    assignedProjectIds: [],
  };
}

function cookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt,
    priority: "high" as const,
  };
}

export async function createSession(input: {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<Date> {
  const token = createOpaqueToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.session.create({
    data: {
      userId: input.userId,
      tokenHash: hashOpaqueToken(token),
      expiresAt,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent?.slice(0, 500),
    },
  });
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(expiresAt));
  return expiresAt;
}

export async function readSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export async function getPrincipal(): Promise<AuthPrincipal | null> {
  const token = await readSessionToken();
  if (!token && demoModeEnabled()) {
    return getDemoPrincipal();
  }
  if (!token) return null;
  const now = new Date();
  const session = await db.session.findUnique({
    where: { tokenHash: hashOpaqueToken(token) },
    include: {
      user: {
        include: {
          teamMemberships: { select: { projectId: true } },
        },
      },
    },
  });
  if (!session || session.revokedAt || session.expiresAt <= now || !session.user.active) {
    if (demoModeEnabled()) {
      return getDemoPrincipal();
    }
    return null;
  }

  const client =
    session.user.role === "CLIENT"
      ? await db.contact.findFirst({
          where: {
            email: { equals: session.user.email, mode: "insensitive" },
            client: { organizationId: session.user.organizationId },
          },
          select: { clientId: true },
        })
      : null;

  if (!session.lastSeenAt || now.getTime() - session.lastSeenAt.getTime() > 5 * 60 * 1000) {
    void db.session.update({ where: { id: session.id }, data: { lastSeenAt: now } }).catch(() => undefined);
  }
  return {
    sessionId: session.id,
    userId: session.user.id,
    organizationId: session.user.organizationId,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    clientId: client?.clientId,
    assignedProjectIds: session.user.teamMemberships.map((membership) => membership.projectId),
  };
}

export async function requirePrincipal(): Promise<AuthPrincipal> {
  const principal = await getPrincipal();
  if (!principal) {
    const error = new Error("Authentication required");
    error.name = "UnauthorizedError";
    throw error;
  }
  return principal;
}

export async function revokeCurrentSession(): Promise<void> {
  const token = await readSessionToken();
  if (token) {
    await db.session.updateMany({
      where: { tokenHash: hashOpaqueToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  (await cookies()).delete(SESSION_COOKIE);
}

export async function revokeAllUserSessions(userId: string): Promise<number> {
  const result = await db.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return result.count;
}
