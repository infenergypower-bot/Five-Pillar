import { AppShell } from "@/components/app-shell";
import { ResearchDetail } from "@/components/business-research-workspace";
import { Suspense } from "react";

async function ResearchDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResearchDetail id={id} />;
}

export default function BusinessResearchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<p>Loading company research...</p>}><AppShell title="Business intelligence" eyebrow="Company research"><ResearchDetailContent params={params} /></AppShell></Suspense>;
}


