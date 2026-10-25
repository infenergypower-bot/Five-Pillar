import { describe, expect, it } from "vitest";
import { InvoiceStatus, ProposalStatus, QuoteStatus, RevisionCategory } from "@prisma/client";
import { assertProposalStatusTransition, assertQuoteStatusTransition, assertRevisionInvariant, deriveInvoiceStatus } from "./invariants";

describe("transactional service invariants", () => {
  it("allows only explicit quote workflow transitions", () => {
    expect(() => assertQuoteStatusTransition(QuoteStatus.DRAFT, QuoteStatus.INTERNAL_REVIEW)).not.toThrow();
    expect(() => assertQuoteStatusTransition(QuoteStatus.DRAFT, QuoteStatus.ACCEPTED)).toThrow("Invalid quote transition");
    expect(() => assertQuoteStatusTransition(QuoteStatus.SENT, QuoteStatus.ACCEPTED)).not.toThrow();
  });

  it("requires proposal review before sending and client acceptance", () => {
    expect(() => assertProposalStatusTransition(ProposalStatus.DRAFT, ProposalStatus.INTERNAL_REVIEW)).not.toThrow();
    expect(() => assertProposalStatusTransition(ProposalStatus.INTERNAL_REVIEW, ProposalStatus.SENT)).not.toThrow();
    expect(() => assertProposalStatusTransition(ProposalStatus.DRAFT, ProposalStatus.SENT)).toThrow("Invalid proposal transition");
    expect(() => assertProposalStatusTransition(ProposalStatus.SENT, ProposalStatus.ACCEPTED)).toThrow("Invalid proposal transition");
  });

  it("requires billable out-of-scope revisions to have an estimate", () => {
    expect(() => assertRevisionInvariant({
      category: RevisionCategory.OUT_OF_SCOPE_REQUEST,
      includedInScope: true,
      estimatedCost: 100,
    })).toThrow("cannot be marked included");
    expect(() => assertRevisionInvariant({
      category: RevisionCategory.CLIENT_CHANGE_OF_DIRECTION,
      includedInScope: false,
    })).toThrow("require an estimated cost");
    expect(() => assertRevisionInvariant({
      category: RevisionCategory.CLIENT_CHANGE_OF_DIRECTION,
      includedInScope: false,
      estimatedCost: 250,
    })).not.toThrow();
  });

  it("reconciles invoice state from succeeded cash without overstating collection", () => {
    const due = new Date("2026-01-01T00:00:00Z");
    const now = new Date("2026-01-02T00:00:00Z");
    expect(deriveInvoiceStatus(1000, 0, due, now)).toBe(InvoiceStatus.OVERDUE);
    expect(deriveInvoiceStatus(1000, 250, due, now)).toBe(InvoiceStatus.PARTIALLY_PAID);
    expect(deriveInvoiceStatus(1000, 1000, due, now)).toBe(InvoiceStatus.PAID);
  });
});
