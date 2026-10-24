export function demoModeEnabled(): boolean {
  return process.env.DEMO_MODE === "true";
}

export function redirectsDemoAuth(pathname: string, enabled = demoModeEnabled()): boolean {
  return enabled && (pathname === "/login" || pathname === "/logout" || pathname.startsWith("/password-reset"));
}
