import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { env } from "../env";

function deliveryKey(): Buffer {
  return createHmac("sha256", "five-pillar-delivery-payload").update(env().AUTH_SECRET).digest();
}

export function encryptDeliveryPayload(payload: Record<string, unknown>): Prisma.InputJsonObject {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deliveryKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  return {
    protected: true,
    algorithm: "A256GCM",
    iv: iv.toString("base64url"),
    tag: cipher.getAuthTag().toString("base64url"),
    ciphertext: ciphertext.toString("base64url"),
  };
}

export function decryptDeliveryPayload(payload: Prisma.JsonValue | Prisma.InputJsonValue | null): Record<string, unknown> {
  const record = payload && typeof payload === "object" && !Array.isArray(payload)
    ? payload as Record<string, unknown>
    : null;
  if (!record || record.protected !== true) {
    return payload && typeof payload === "object" && !Array.isArray(payload) ? payload as Record<string, unknown> : { value: payload };
  }
  const { iv, tag, ciphertext } = record;
  if (typeof iv !== "string" || typeof tag !== "string" || typeof ciphertext !== "string") {
    throw new Error("Protected delivery payload is malformed");
  }
  const decipher = createDecipheriv("aes-256-gcm", deliveryKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
  const decoded: unknown = JSON.parse(plaintext);
  if (!decoded || typeof decoded !== "object" || Array.isArray(decoded)) throw new Error("Protected delivery payload is invalid");
  return decoded as Record<string, unknown>;
}
