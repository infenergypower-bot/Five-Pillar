import { beforeAll, describe, expect, it } from "vitest";
import { decryptDeliveryPayload, encryptDeliveryPayload } from "./delivery-payload";

beforeAll(() => {
  process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
  process.env.AUTH_SECRET ??= "test-auth-secret-at-least-thirty-two-characters";
  process.env.APP_URL ??= "https://app.example.test";
});

describe("protected delivery payloads", () => {
  it("encrypts reset URLs at rest and authenticates decryption", () => {
    const resetUrl = "https://app.example.test/password-reset?token=plaintext-secret";
    const protectedPayload = encryptDeliveryPayload({ resetUrl });
    expect(JSON.stringify(protectedPayload)).not.toContain("plaintext-secret");
    expect(decryptDeliveryPayload(protectedPayload)).toEqual({ resetUrl });
  });
});
