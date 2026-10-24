import { requirePrincipal } from "@/lib/auth";
import { renderProposalPdf } from "@/lib/proposal-pdf";
import { getProposal, normalizeServiceError } from "@/lib/services";

interface ProposalSections {
  project?: { title?: string };
  scope?: unknown;
  investment?: unknown;
}

function descriptions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === "string" && item.trim()) return [item];
    if (item && typeof item === "object" && "description" in item && typeof item.description === "string" && item.description.trim()) return [item.description];
    return [];
  });
}

function investment(value: unknown): { total?: string; currency?: string } {
  if (!value || typeof value !== "object") return {};
  const record = value as Record<string, unknown>;
  return {
    ...(typeof record.total === "string" ? { total: record.total } : {}),
    ...(typeof record.currency === "string" ? { currency: record.currency } : {}),
  };
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const principal = await requirePrincipal();
    const proposal = await getProposal(principal, (await context.params).id);
    const current = proposal.versions[0];
    if (!current) return Response.json({ error: { code: "NOT_FOUND", message: "Proposal version not found." } }, { status: 404 });
    const sections = current.sections as ProposalSections;
    const scope = descriptions(sections.scope);
    const clientInvestment = investment(sections.investment);
    const bytes = await renderProposalPdf({
      proposalNumber: `FP-${proposal.id.slice(-8).toUpperCase()}`,
      clientName: proposal.client?.displayName ?? "Five Pillar Client",
      projectTitle: proposal.quote.projectTitle,
      overview: `Five Pillar proposes the following ${proposal.quote.servicePath.toLowerCase().replaceAll("_", " ")} engagement.`,
      scope: scope.length ? scope : ["Services described in the accepted quote"],
      deliverables: scope.length ? scope : ["Approved project deliverables"],
      timeline: "The production schedule begins after required assets, agreement, and deposit conditions are confirmed.",
      revisionPolicy: "Included revisions follow the approved quote and agreement. Out-of-scope changes require a change order.",
      paymentSchedule: ["50% deposit", "25% at the approved production milestone", "25% before final delivery"],
      usageRights: "Usage rights are governed by the executed agreement and documented asset permissions.",
      exclusions: ["Advertising media spend unless itemized", "Unlicensed third-party materials", "Work outside the approved scope"],
      totalInvestment: clientInvestment.total ?? "See accepted quote",
      currency: clientInvestment.currency ?? proposal.quote.currency,
      expiresAt: proposal.expiresAt ?? undefined,
      nextSteps: "Accept the current proposal version, complete the agreement, and satisfy the required deposit before production begins.",
    });
    const body = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    return new Response(body, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="proposal-${proposal.id}.pdf"`,
        "cache-control": "private, no-store",
      },
    });
  } catch (error) {
    const normalized = normalizeServiceError(error);
    return Response.json({ error: { code: normalized.code, message: normalized.message } }, { status: normalized.status });
  }
}
