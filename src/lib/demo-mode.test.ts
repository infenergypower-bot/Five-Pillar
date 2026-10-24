import { describe, expect, it } from "vitest";
import { redirectsDemoAuth } from "./demo-mode";

describe("public workspace mode", () => {
  it.each(["/login", "/logout", "/password-reset", "/password-reset/token"])("redirects %s when no-sign-in access is enabled", (pathname) => {
    expect(redirectsDemoAuth(pathname, true)).toBe(true);
  });

  it("preserves auth routes in authenticated mode", () => {
    expect(redirectsDemoAuth("/login", false)).toBe(false);
  });
});
