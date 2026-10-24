import { describe, expect, it } from "vitest";
import { assertClientSafe, renderProposalPdf } from "./proposal-pdf";

const proposal = {
  proposalNumber: "FP-2026-001",
  clientName: "Northstar Robotics",
  projectTitle: "Product launch commercial",
  overview: "A cinematic product launch designed for approved digital channels.",
  scope: ["Creative development", "Production", "Postproduction"],
  deliverables: ["One 30-second master", "Three approved cutdowns"],
  timeline: "Four weeks after required assets and deposit are confirmed.",
  revisionPolicy: "Two consolidated revision rounds are included.",
  paymentSchedule: ["50% deposit", "25% at approved production milestone", "25% before final delivery"],
  usageRights: "Digital campaign use according to the executed agreement.",
  exclusions: ["Advertising media spend", "Unlicensed third-party materials"],
  totalInvestment: "$5,500.00",
  currency: "USD",
  nextSteps: "Accept the proposal and complete the agreement and deposit workflow.",
};

describe("proposal PDF", () => {
  it("generates a real PDF document from client-safe fields", async () => {
    const bytes = await renderProposalPdf(proposal);
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
    expect(bytes.length).toBeGreaterThan(1000);
  });

  it("rejects internal economics at runtime", () => {
    expect(() => assertClientSafe({ ...proposal, operatingMargin: 0.55 })).toThrow("forbidden internal field");
    expect(() => assertClientSafe({ ...proposal, nested: { hourlyRate: 75 } })).toThrow("forbidden internal field");
  });
});
