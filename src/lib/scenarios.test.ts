import { describe, expect, it } from "vitest";
import { calculateIntakeCompleteness } from "./intake";
import {
  calculateCombinedServices,
  calculateOriginalIpProjection,
  calculateQuote,
  calculateServiceEstimate,
  canApproveQuote,
} from "./pricing";
import { assertProjectTransition, invoiceStatus, projectBlueprintFromAcceptedQuote } from "./workflow";

describe("required operating demonstrations", () => {
  it("Scenario A: moves a commercial customer from complete intake to production and paid delivery", () => {
    const intake = calculateIntakeCompleteness(["VISUAL_PRODUCTION"], {
      businessName: "Northstar Robotics",
      primaryObjective: "Launch a new product",
      brandProfile: "Industrial innovation",
      productionType: "30-second product commercial",
      visualDirection: "Cinematic realism",
      productReferences: ["logo", "product photo"],
      deadline: "2026-11-18",
    });
    expect(intake.readyForProduction).toBe(true);
    const quote = calculateQuote({ labor: 2400, directCosts: 600, allocatedOverhead: 300, contingencyRate: 0.1 });
    expect(quote.operatingMargin.toNumber()).toBeCloseTo(0.55);
    const project = projectBlueprintFromAcceptedQuote({ quoteId: "commercial-quote", clientId: "northstar", title: "NX-4 launch", servicePath: "VISUAL_PRODUCTION" });
    expect(project.approvals).toContain("DELIVERY");
    expect(invoiceStatus({ amount: 8000, paid: 8000, dueAt: new Date("2026-11-01") })).toBe("PAID");
  });

  it("Scenario B: prices managed marketing with founder labor and attributable Alphi infrastructure", () => {
    const intake = calculateIntakeCompleteness(["MANAGED_MARKETING"], {
      businessName: "Aurelia",
      primaryObjective: "Increase qualified demand",
      brandProfile: "Premium personal care",
      socialProfiles: ["instagram.com/aurelia"],
      approvalPreferences: "Weekly consolidated review",
      contentVolume: "20 monthly assets",
      deadline: "2026-12-01",
    });
    expect(intake.readyForProduction).toBe(true);
    const monthlyCost = calculateServiceEstimate({
      service: "MANAGED_MARKETING",
      labor: 2200,
      directCosts: 350,
      overhead: 300,
      subscriptionCosts: [{ id: "alphi", amount: 240, allocation: 0.5, category: "ALPHI_INFRASTRUCTURE" }],
    });
    expect(monthlyCost.toNumber()).toBe(2970);
    expect(calculateQuote({ labor: monthlyCost, directCosts: 0, allocatedOverhead: 0, contingencyRate: 0 }).recommendedPrice.toNumber()).toBe(6600);
  });

  it("Scenario C: consolidates hybrid service costs without double-counting shared tools", () => {
    const shared = { id: "creative-suite", amount: 120, allocation: 1, category: "CORPORATE" as const };
    const total = calculateCombinedServices([
      { service: "VISUAL_PRODUCTION", labor: 2000, directCosts: 500, overhead: 200, subscriptionCosts: [shared] },
      { service: "MANAGED_MARKETING", labor: 1500, directCosts: 300, overhead: 150, subscriptionCosts: [shared, { id: "alphi", amount: 100, allocation: 1, category: "ALPHI_INFRASTRUCTURE" }] },
    ]);
    expect(total.toNumber()).toBe(4870);
  });

  it("Scenario D: plans internally sponsored original entertainment without an external quote", () => {
    const project = projectBlueprintFromAcceptedQuote({ quoteId: "internal-budget-authorization", title: "Signal", servicePath: "ORIGINAL_ENTERTAINMENT" });
    expect(project.clientId).toBeUndefined();
    const projection = calculateOriginalIpProjection({ productionCost: 75000, releaseCost: 25000, distributionDeductionRate: 0.2, partnerParticipationRate: 0.1 });
    expect(projection.breakEvenGrossRevenue.toNumber()).toBe(142857.14);
    expect(projection.speculative).toBe(true);
  });

  it("Scenario E: blocks an ordinary $2,995 quote after costs breach the minimum margin", () => {
    const quote = calculateQuote({ labor: 1800, directCosts: 100, allocatedOverhead: 50, contingencyRate: 0.05, quotedPrice: 2995 });
    expect(quote.operatingMargin.lt(0.5)).toBe(true);
    expect(canApproveQuote(quote, "SALES_ACCOUNT").allowed).toBe(false);
    expect(canApproveQuote(quote, "SUPER_ADMIN", "Founder-approved strategic exception").allowed).toBe(true);
    expect(() => assertProjectTransition("INTAKE", "DELIVERY")).toThrow();
  });
});
