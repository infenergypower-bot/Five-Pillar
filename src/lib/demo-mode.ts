const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export const publicDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function demoModeEnabled(): boolean {
  return process.env.DEMO_MODE === "true";
}

export function blocksDemoMutation(method: string, pathname: string, enabled = demoModeEnabled()): boolean {
  return enabled && pathname.startsWith("/api/") && !safeMethods.has(method.toUpperCase());
}
