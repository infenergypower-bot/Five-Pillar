"use client";

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

interface WorkspaceAccess {
  publicAccess: boolean;
  writable: boolean;
}

const WorkspaceAccessContext = createContext<WorkspaceAccess>({ publicAccess: false, writable: false });

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [access, setAccess] = useState<WorkspaceAccess>({ publicAccess: false, writable: false });

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/demo-mode", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Demo mode check failed with HTTP ${response.status}.`);
        return response.json() as Promise<{ enabled?: boolean; writable?: boolean }>;
      })
      .then((body) => setAccess({ publicAccess: body.enabled === true, writable: body.writable === true }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setAccess({ publicAccess: false, writable: false });
      });
    return () => controller.abort();
  }, []);

  return <WorkspaceAccessContext.Provider value={access}>{children}</WorkspaceAccessContext.Provider>;
}

export function useDemoMode(): boolean {
  return !useContext(WorkspaceAccessContext).writable;
}

export function useWorkspaceAccess(): WorkspaceAccess {
  return useContext(WorkspaceAccessContext);
}
