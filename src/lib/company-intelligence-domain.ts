/** Evidence and decision rules for the Five Pillar research workflow.
 * This module deliberately has no network or database side effects.
 */

export type EvidenceKind = "VERIFIED" | "INFERRED" | "HYPOTHESIS" | "UNKNOWN";
export type ReviewStatus = "DRAFT" | "APPROVED" | "REJECTED";
export type SourceType = "PUBLIC_WEB" | "CLIENT_DOCUMENT" | "CLIENT_STATEMENT" | "ANALYTICS" | "LICENSED_REFERENCE";

export interface EvidenceSource {
  id: string;
  type: SourceType;
  title: string;
  reference: string;
  capturedAt: string;
  rightsStatus: "CLEARED" | "METADATA_ONLY" | "REVIEW_REQUIRED";
}

export interface ResearchClaim {
  id: string;
  fieldKey: string;
  value: unknown;
  kind: EvidenceKind;
  sourceIds: string[];
  rationale?: string;
  confidence?: number;
  reviewedBy?: string;
  reviewedAt?: string;
  status: ReviewStatus;
}

export interface ResearchProfile {
  id: string;
  businessName: string;
  description: string;
  website?: string;
  claims: ResearchClaim[];
  sources: EvidenceSource[];
  status: ReviewStatus;
  approvedBy?: string;
  approvedAt?: string;
}

export interface ResearchOpportunity {
  id: string;
  title: string;
  evidenceClaimIds: string[];
  pillar: "BUSINESS_INTELLIGENCE" | "STRATEGIC_GROWTH" | "BRAND_EXCELLENCE" | "CINEMATIC_ADVERTISING" | "MARKET_IMPACT";
  impact: number;
  effort: number;
  uncertainty: number;
  status: ReviewStatus;
}

function validDate(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

export function validateClaim(claim: ResearchClaim, sourceIds: ReadonlySet<string>): string[] {
  const errors: string[] = [];
  if (!claim.id.trim() || !claim.fieldKey.trim()) errors.push("Claim ID and field key are required");
  if (claim.kind === "UNKNOWN" && claim.value !== null) errors.push("Unknown claims must have a null value");
  if (claim.kind !== "UNKNOWN" && (claim.value === null || claim.value === undefined || claim.value === "")) errors.push("Known claims require a value");
  if (claim.kind === "VERIFIED" && claim.sourceIds.length === 0) errors.push("Verified claims require evidence");
  if ((claim.kind === "INFERRED" || claim.kind === "HYPOTHESIS") && !claim.rationale?.trim()) errors.push("Inferences and hypotheses require a rationale");
  if (claim.confidence !== undefined && (!Number.isFinite(claim.confidence) || claim.confidence < 0 || claim.confidence > 1)) errors.push("Confidence must be between 0 and 1");
  for (const id of claim.sourceIds) if (!sourceIds.has(id)) errors.push(`Missing evidence source: ${id}`);
  if (claim.status === "APPROVED" && (!claim.reviewedBy?.trim() || !claim.reviewedAt || !validDate(claim.reviewedAt))) errors.push("Approved claims require reviewer and review date");
  return errors;
}

export function assessProfile(profile: ResearchProfile, requiredFields: readonly string[]): { ready: boolean; errors: string[]; openQuestions: string[] } {
  const errors: string[] = [];
  const openQuestions: string[] = [];
  if (!profile.businessName.trim() || !profile.description.trim()) errors.push("Business name and description are required");
  const sourceIds = new Set<string>();
  for (const source of profile.sources) {
    if (sourceIds.has(source.id)) errors.push(`Duplicate source ID: ${source.id}`);
    sourceIds.add(source.id);
    if (!source.title.trim() || !source.reference.trim() || !validDate(source.capturedAt)) errors.push(`Source ${source.id} needs a title, reference, and valid capture date`);
  }
  const claimIds = new Set<string>();
  for (const claim of profile.claims) {
    if (claimIds.has(claim.id)) errors.push(`Duplicate claim ID: ${claim.id}`);
    claimIds.add(claim.id);
    errors.push(...validateClaim(claim, sourceIds).map((error) => `${claim.fieldKey}: ${error}`));
  }
  for (const field of requiredFields) {
    const approved = profile.claims.find((claim) => claim.fieldKey === field && claim.status === "APPROVED" && claim.kind !== "UNKNOWN");
    if (!approved) openQuestions.push(field);
  }
  if (profile.status === "APPROVED" && (!profile.approvedBy?.trim() || !profile.approvedAt || !validDate(profile.approvedAt))) errors.push("Approved profile requires approver and approval date");
  return { ready: profile.status === "APPROVED" && errors.length === 0 && openQuestions.length === 0, errors, openQuestions };
}

export function assessOpportunity(opportunity: ResearchOpportunity, claims: readonly ResearchClaim[]): string[] {
  const errors: string[] = [];
  if (!opportunity.title.trim()) errors.push("Opportunity title is required");
  if (opportunity.evidenceClaimIds.length === 0) errors.push("Opportunity requires linked evidence");
  const claimMap = new Map(claims.map((claim) => [claim.id, claim]));
  for (const id of opportunity.evidenceClaimIds) {
    const claim = claimMap.get(id);
    if (!claim || claim.kind === "UNKNOWN" || claim.status !== "APPROVED") errors.push(`Evidence claim ${id} is missing or unapproved`);
  }
  for (const key of ["impact", "effort", "uncertainty"] as const) {
    const score = opportunity[key];
    if (!Number.isInteger(score) || score < 1 || score > 5) errors.push(`${key} must be an integer from 1 to 5`);
  }
  return errors;
}

/** For sorting only; a score is not an ROI forecast. */
export function opportunityPriority(opportunity: ResearchOpportunity): number {
  return opportunity.impact * 2 - opportunity.effort - opportunity.uncertainty;
}

