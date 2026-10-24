"use client";

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

const DemoModeContext = createContext(true);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/demo-mode", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Demo mode check failed with HTTP ${response.status}.`);
        return response.json() as Promise<{ enabled?: boolean }>;
      })
      .then((body) => setEnabled(body.enabled === true))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setEnabled(true);
      });
    return () => controller.abort();
  }, []);

  return <DemoModeContext.Provider value={enabled}>{children}</DemoModeContext.Provider>;
}

export function useDemoMode(): boolean {
  return useContext(DemoModeContext);
}
