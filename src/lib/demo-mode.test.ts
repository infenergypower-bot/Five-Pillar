import { describe, expect, it } from "vitest";
import { blocksDemoMutation, redirectsDemoAuth } from "./demo-mode";

describe("read-only demo mode", () => {
  it.each(["GET", "HEAD", "OPTIONS"])("allows %s API requests", (method) => {
    expect(blocksDemoMutation(method, "/api/projects", true)).toBe(false);
  });

  it.each(["POST", "PUT", "PATCH", "DELETE"])("blocks %s API requests", (method) => {
    expect(blocksDemoMutation(method, "/api/projects", true)).toBe(true);
  });

  it("does not affect non-API requests or disabled environments", () => {
    expect(blocksDemoMutation("POST", "/login", true)).toBe(false);
    expect(blocksDemoMutation("POST", "/api/projects", false)).toBe(false);
  });

  it.each(["/login", "/logout", "/password-reset", "/password-reset/token"])("redirects %s in demo mode", (pathname) => {
    expect(redirectsDemoAuth(pathname, true)).toBe(true);
  });
});
