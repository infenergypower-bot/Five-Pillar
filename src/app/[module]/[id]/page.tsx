import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { RecordDetail } from "@/components/record-detail";
import { modules } from "@/lib/modules";

export const instant = false;

export default async function RecordPage({ params }: { params: Promise<{ module: string; id: string }> }) {
  const { module: slug, id } = await params;
  const definition = modules[slug];
  if (!definition) notFound();
  return <AppShell title={definition.title} eyebrow={definition.eyebrow}><RecordDetail module={slug} id={id} title={definition.title} /></AppShell>;
}
