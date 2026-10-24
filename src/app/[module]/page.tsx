import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ResourceWorkspace } from "@/components/resource-workspace";
import { modules } from "@/lib/modules";

export const instant = false;

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module: slug } = await params;
  const definition = modules[slug];
  if (!definition) notFound();
  return <AppShell title={definition.title} eyebrow={definition.eyebrow}><ResourceWorkspace module={definition} /></AppShell>;
}
