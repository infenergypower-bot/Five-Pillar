import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { encryptDeliveryPayload } from "@/lib/services/delivery-payload";
import { createOpaqueToken, hashOpaqueToken } from "./tokens";

const requestSchema = z.object({
  organization: z.string().trim().min(1).max(80).toLowerCase(),
  email: z.email().trim().toLowerCase(),
});
const consumeSchema = z.object({
  token: z.string().min(32).max(256),
  password: z.string().min(12).max(256).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
});

export async function createPasswordReset(raw: unknown, requestedIp?: string): Promise<{ accepted: true }> {
  const input = requestSchema.parse(raw);
  const organization = await db.organization.findUnique({ where: { slug: input.organization }, select: { id: true } });
  const user = organization
    ? await db.user.findUnique({
        where: { organizationId_email: { organizationId: organization.id, email: input.email } },
        select: { id: true, active: true },
      })
    : null;
  if (user?.active) {
    const token = createOpaqueToken();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const resetUrl = new URL("/password-reset", env().APP_URL);
    resetUrl.searchParams.set("token", token);
    await db.$transaction([
      db.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashOpaqueToken(token),
          expiresAt,
          requestedIp,
        },
      }),
      db.emailMessage.create({
        data: {
          organizationId: organization!.id,
          toAddresses: [input.email],
          ccAddresses: [],
          subject: "Reset your Five Pillar password",
          templateKey: "password-reset",
          payload: encryptDeliveryPayload({
            resetUrl: resetUrl.toString(),
            expiresAt: expiresAt.toISOString(),
          }),
        },
      }),
    ]);
  }
  return { accepted: true };
}

export async function consumePasswordReset(raw: unknown): Promise<boolean> {
  const input = consumeSchema.parse(raw);
  const tokenHash = hashOpaqueToken(input.token);
  const now = new Date();
  const passwordHash = await hash(input.password, 12);
  return db.$transaction(async (tx) => {
    const token = await tx.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!token || token.usedAt || token.expiresAt <= now) return false;
    const claimed = await tx.passwordResetToken.updateMany({
      where: { id: token.id, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    });
    if (claimed.count !== 1) return false;
    await tx.user.update({ where: { id: token.userId }, data: { passwordHash } });
    await tx.session.updateMany({ where: { userId: token.userId, revokedAt: null }, data: { revokedAt: now } });
    return true;
  });
}
