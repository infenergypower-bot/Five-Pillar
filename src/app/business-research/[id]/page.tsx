import { AppShell } from "@/components/app-shell";
import { ResearchDetail } from "@/components/business-research-workspace";

export default async function BusinessResearchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AppShell title="Business intelligence" eyebrow="Company research"><ResearchDetail id={id} /></AppShell>;
}
