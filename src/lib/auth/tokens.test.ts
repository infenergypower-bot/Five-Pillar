import { describe, expect, it } from "vitest";
import { createOpaqueToken, hashOpaqueToken, tokenHashMatches } from "./tokens";

describe("opaque authentication tokens", () => {
  it("creates high-entropy URL-safe tokens and stores only deterministic hashes", () => {
    const token = createOpaqueToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(hashOpaqueToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashOpaqueToken(token)).not.toContain(token);
    expect(tokenHashMatches(token, hashOpaqueToken(token))).toBe(true);
  });

  it("does not match a different token or malformed hash", () => {
    const token = createOpaqueToken();
    expect(tokenHashMatches(createOpaqueToken(), hashOpaqueToken(token))).toBe(false);
    expect(tokenHashMatches(token, "not-a-hash")).toBe(false);
  });
});
