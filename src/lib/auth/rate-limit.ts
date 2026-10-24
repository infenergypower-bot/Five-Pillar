import { hashOpaqueToken } from "./tokens";
import { db } from "@/lib/db";

const WINDOW_SECONDS = 15 * 60;
const MAX_ATTEMPTS = 5;
const BLOCK_SECONDS = 30 * 60;

export function loginRateLimitKey(email: string, ipAddress: string): string {
  return hashOpaqueToken(`${email.trim().toLowerCase()}\0${ipAddress}`);
}

export async function consumeLoginAttempt(email: string, ipAddress: string, now = new Date()): Promise<void> {
  const windowMs = WINDOW_SECONDS * 1000;
  const windowStart = new Date(Math.floor(now.getTime() / windowMs) * windowMs);
  const keyHash = loginRateLimitKey(email, ipAddress);
  const activeBlock = await db.rateLimitBucket.findFirst({
    where: { keyHash, action: "login", blockedUntil: { gt: now } },
    select: { id: true },
  });
  if (activeBlock) throw new Error("LOGIN_RATE_LIMITED");
  const bucket = await db.rateLimitBucket.upsert({
    where: { keyHash_action_windowStart: { keyHash, action: "login", windowStart } },
    create: { keyHash, action: "login", windowStart, windowSeconds: WINDOW_SECONDS, count: 1 },
    update: { count: { increment: 1 } },
  });
  if (bucket.blockedUntil && bucket.blockedUntil > now) throw new Error("LOGIN_RATE_LIMITED");
  if (bucket.count > MAX_ATTEMPTS) {
    const blockedUntil = new Date(now.getTime() + BLOCK_SECONDS * 1000);
    await db.rateLimitBucket.update({ where: { id: bucket.id }, data: { blockedUntil } });
    throw new Error("LOGIN_RATE_LIMITED");
  }
}

export async function resetLoginRateLimit(email: string, ipAddress: string): Promise<void> {
  await db.rateLimitBucket.deleteMany({
    where: { keyHash: loginRateLimitKey(email, ipAddress), action: "login" },
  });
}
