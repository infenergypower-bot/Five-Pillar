const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export function demoModeEnabled(): boolean {
  return process.env.DEMO_MODE === "true";
}

export function blocksDemoMutation(method: string, pathname: string, enabled = demoModeEnabled()): boolean {
  return enabled && pathname.startsWith("/api/") && !safeMethods.has(method.toUpperCase());
}

export function redirectsDemoAuth(pathname: string, enabled = demoModeEnabled()): boolean {
  return enabled && (pathname === "/login" || pathname === "/logout" || pathname.startsWith("/password-reset"));
}
