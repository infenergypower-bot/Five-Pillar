import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "./session";
import { consumeLoginAttempt, resetLoginRateLimit } from "./rate-limit";
import { decryptMfaSecret, verifyTotp } from "./mfa";

export const loginSchema = z.object({
  organization: z.string().trim().min(1).max(80).toLowerCase(),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1).max(256),
  mfaCode: z.string().trim().regex(/^\d{6}$/).optional(),
});

export type LoginResult =
  | { ok: true; expiresAt: Date }
  | { ok: false; code: "INVALID_CREDENTIALS" | "RATE_LIMITED" | "MFA_REQUIRED" | "MFA_SETUP_REQUIRED" };

export async function authenticatePassword(
  rawInput: unknown,
  metadata: { ipAddress: string; userAgent?: string },
): Promise<LoginResult> {
  const input = loginSchema.parse(rawInput);
  try {
    await consumeLoginAttempt(input.email, metadata.ipAddress);
  } catch {
    return { ok: false, code: "RATE_LIMITED" };
  }
  const organization = await db.organization.findUnique({ where: { slug: input.organization }, select: { id: true } });
  const user = organization
    ? await db.user.findUnique({
        where: { organizationId_email: { organizationId: organization.id, email: input.email } },
        include: { mfaEnrollment: true },
      })
    : null;
  const passwordValid = Boolean(user?.active && user.passwordHash && (await compare(input.password, user.passwordHash)));
  let failureReason: string | undefined;
  if (!passwordValid) failureReason = "invalid_credentials";
  if (passwordValid && user?.mfaRequired) {
    if (!user.mfaEnrollment?.verifiedAt || user.mfaEnrollment.disabledAt || !user.mfaEnrollment.secretCiphertext) {
      failureReason = "mfa_setup_required";
    } else if (!input.mfaCode || !verifyTotp(decryptMfaSecret(user.mfaEnrollment.secretCiphertext), input.mfaCode)) {
      failureReason = "mfa_required";
    }
  }
  await db.loginAttempt.create({
    data: {
      userId: user?.id,
      organizationId: organization?.id,
      emailNormalized: input.email,
      ipAddress: metadata.ipAddress,
      succeeded: !failureReason,
      failureReason,
    },
  });
  if (failureReason === "mfa_setup_required") return { ok: false, code: "MFA_SETUP_REQUIRED" };
  if (failureReason === "mfa_required") return { ok: false, code: "MFA_REQUIRED" };
  if (!user || failureReason) return { ok: false, code: "INVALID_CREDENTIALS" };
  await resetLoginRateLimit(input.email, metadata.ipAddress);
  const expiresAt = await createSession({ userId: user.id, ...metadata });
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return { ok: true, expiresAt };
}
