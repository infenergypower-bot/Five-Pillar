import { describe, expect, it } from "vitest";
import { assessOpportunity, assessProfile, type ResearchClaim, type ResearchProfile } from "./company-intelligence-domain";

const source = { id: "source-1", type: "PUBLIC_WEB" as const, title: "Official site", reference: "https://example.com", capturedAt: "2026-11-18T00:00:00Z", rightsStatus: "METADATA_ONLY" as const };
const claim: ResearchClaim = { id: "claim-1", fieldKey: "business_model", value: "Direct sales", kind: "VERIFIED", sourceIds: [source.id], status: "APPROVED", reviewedBy: "reviewer-1", reviewedAt: "2026-11-18T00:00:00Z" };
const profile: ResearchProfile = { id: "profile-1", businessName: "Example", description: "Sells products", sources: [source], claims: [claim], status: "APPROVED", approvedBy: "reviewer-1", approvedAt: "2026-11-18T00:00:00Z" };

describe("research decision gates", () => {
  it("allows an approved profile with sourced reviewed claims", () => {
    expect(assessProfile(profile, ["business_model"])).toEqual({ ready: true, errors: [], openQuestions: [] });
  });

  it("blocks unsupported claims and surfaces missing owner questions", () => {
    const result = assessProfile({ ...profile, claims: [{ ...claim, sourceIds: [] }] }, ["business_model", "audience"]);
    expect(result.ready).toBe(false);
    expect(result.errors).toContain("business_model: Verified claims require evidence");
    expect(result.openQuestions).toEqual(["audience"]);
  });

  it("does not turn unknown or unapproved research into a recommendation", () => {
    const errors = assessOpportunity({ id: "gap-1", title: "Fix checkout", evidenceClaimIds: ["claim-1"], pillar: "STRATEGIC_GROWTH", impact: 5, effort: 2, uncertainty: 2, status: "DRAFT" }, [{ ...claim, kind: "UNKNOWN", value: null }]);
    expect(errors).toContain("Evidence claim claim-1 is missing or unapproved");
  });
});

