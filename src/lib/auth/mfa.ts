import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import type { AuthPrincipal } from "./session";
import { createOpaqueToken, hashOpaqueToken } from "./tokens";

function key(): Buffer {
  return createHmac("sha256", "five-pillar-mfa").update(env().AUTH_SECRET).digest();
}

export function encryptMfaSecret(secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString("base64url")).join(".");
}

export function decryptMfaSecret(ciphertext: string): string {
  const [ivText, tagText, encryptedText] = ciphertext.split(".");
  if (!ivText || !tagText || !encryptedText) throw new Error("Invalid MFA secret");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(ivText, "base64url"));
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedText, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function decodeBase32(value: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const character of value.toUpperCase().replaceAll(/[^A-Z2-7]/g, "")) {
    const index = alphabet.indexOf(character);
    if (index < 0) throw new Error("Invalid TOTP secret");
    bits += index.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  return Buffer.from(bytes);
}

function totp(secret: string, counter: number): string {
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", decodeBase32(secret)).update(message).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return binary.toString().padStart(6, "0");
}

export function verifyTotp(secret: string, code: string, now = Date.now()): boolean {
  if (!/^\d{6}$/.test(code)) return false;
  const submitted = Buffer.from(code);
  const counter = Math.floor(now / 30_000);
  return [-1, 0, 1].some((offset) => timingSafeEqual(submitted, Buffer.from(totp(secret, counter + offset))));
}

function encodeBase32(buffer: Buffer): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = [...buffer].map((byte) => byte.toString(2).padStart(8, "0")).join("");
  let result = "";
  while (bits.length) {
    result += alphabet[Number.parseInt(bits.slice(0, 5).padEnd(5, "0"), 2)];
    bits = bits.slice(5);
  }
  return result;
}

export async function beginMfaEnrollment(principal: AuthPrincipal, raw: unknown) {
  const input = z.object({ password: z.string().min(1).max(256) }).parse(raw);
  const user = await db.user.findUnique({ where: { id: principal.userId }, select: { passwordHash: true, email: true } });
  if (!user?.passwordHash || !(await compare(input.password, user.passwordHash))) throw new Error("INVALID_CREDENTIALS");
  const secret = encodeBase32(randomBytes(20));
  await db.mfaEnrollment.upsert({
    where: { userId: principal.userId },
    create: { userId: principal.userId, secretCiphertext: encryptMfaSecret(secret), recoveryCodeHashes: [] },
    update: { secretCiphertext: encryptMfaSecret(secret), recoveryCodeHashes: [], verifiedAt: null, disabledAt: null },
  });
  const label = encodeURIComponent(`Five Pillar:${user.email}`);
  const issuer = encodeURIComponent("Five Pillar");
  return { secret, otpauthUri: `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&digits=6&period=30` };
}

export async function confirmMfaEnrollment(principal: AuthPrincipal, raw: unknown) {
  const input = z.object({ code: z.string().regex(/^\d{6}$/) }).parse(raw);
  const enrollment = await db.mfaEnrollment.findUnique({ where: { userId: principal.userId } });
  if (!enrollment?.secretCiphertext || enrollment.verifiedAt) throw new Error("MFA_ENROLLMENT_NOT_PENDING");
  if (!verifyTotp(decryptMfaSecret(enrollment.secretCiphertext), input.code)) throw new Error("INVALID_MFA_CODE");
  const recoveryCodes = Array.from({ length: 8 }, () => createOpaqueToken(9));
  await db.$transaction([
    db.mfaEnrollment.update({
      where: { userId: principal.userId },
      data: { verifiedAt: new Date(), recoveryCodeHashes: recoveryCodes.map(hashOpaqueToken) },
    }),
    db.user.update({ where: { id: principal.userId }, data: { mfaRequired: true } }),
  ]);
  return { recoveryCodes };
}
