import { InvoiceStatus, ProposalStatus, QuoteStatus, RevisionCategory } from "@prisma/client";
import { ServiceError } from "./errors";

export function assertQuoteStatusTransition(from: QuoteStatus, to: QuoteStatus): void {
  const allowed: Partial<Record<QuoteStatus, readonly QuoteStatus[]>> = {
    DRAFT: [QuoteStatus.INTERNAL_REVIEW, QuoteStatus.ARCHIVED],
    INTERNAL_REVIEW: [QuoteStatus.DRAFT, QuoteStatus.APPROVED, QuoteStatus.ARCHIVED],
    APPROVED: [QuoteStatus.SENT, QuoteStatus.ARCHIVED],
    SENT: [QuoteStatus.ACCEPTED, QuoteStatus.DECLINED, QuoteStatus.EXPIRED],
  };
  if (!allowed[from]?.includes(to)) throw new ServiceError("INVALID_TRANSITION", `Invalid quote transition: ${from} -> ${to}`, 409);
}

export function assertProposalStatusTransition(from: ProposalStatus, to: ProposalStatus): void {
  const allowed: Partial<Record<ProposalStatus, readonly ProposalStatus[]>> = {
    DRAFT: [ProposalStatus.INTERNAL_REVIEW],
    INTERNAL_REVIEW: [ProposalStatus.DRAFT, ProposalStatus.SENT],
    SENT: [ProposalStatus.DECLINED, ProposalStatus.EXPIRED],
  };
  if (!allowed[from]?.includes(to)) throw new ServiceError("INVALID_TRANSITION", `Invalid proposal transition: ${from} -> ${to}`, 409);
}

export function assertRevisionInvariant(input: {
  category: RevisionCategory;
  includedInScope: boolean;
  estimatedCost?: number;
}): void {
  const outOfScope = new Set<RevisionCategory>([
    RevisionCategory.CLIENT_CHANGE_OF_DIRECTION,
    RevisionCategory.ADDITIONAL_DELIVERABLE,
    RevisionCategory.OUT_OF_SCOPE_REQUEST,
  ]).has(input.category);
  if (outOfScope && input.includedInScope) {
    throw new ServiceError("INVALID_REVISION_SCOPE", "Out-of-scope revisions cannot be marked included", 409);
  }
  if (!input.includedInScope && (input.estimatedCost ?? 0) <= 0) {
    throw new ServiceError("MISSING_REVISION_ESTIMATE", "Billable revisions require an estimated cost", 409);
  }
}

export function deriveInvoiceStatus(total: number, paid: number, dueAt: Date, now = new Date()): InvoiceStatus {
  if (paid >= total) return InvoiceStatus.PAID;
  if (paid > 0) return InvoiceStatus.PARTIALLY_PAID;
  if (dueAt < now) return InvoiceStatus.OVERDUE;
  return InvoiceStatus.OPEN;
}
