import { describe, expect, it } from "vitest";
import { authorize, canAccessRecord, type Principal } from "./authorization";
import { calculateIntakeCompleteness, requirementsFor } from "./intake";
import {
  calculateCombinedServices,
  calculateLabor,
  calculateOriginalIpProjection,
  calculateQuote,
  calculateServiceEstimate,
  canApproveQuote,
  estimateCreditOverage,
} from "./pricing";
import { assertProjectTransition, invoiceStatus, projectBlueprintFromAcceptedQuote } from "./workflow";

describe("operational business rules", () => {
  it("calculates labor using decimal-safe hours and rates", () => {
    expect(calculateLabor([{ hours: 1.25, hourlyCost: 75 }, { hours: 2, hourlyCost: 52 }]).toNumber()).toBe(197.75);
  });

  it("excludes Alphi hosting from a standalone production", () => {
    const cost = calculateServiceEstimate({
      service: "VISUAL_PRODUCTION",
      labor: 1000,
      directCosts: 100,
      overhead: 50,
      subscriptionCosts: [
        { id: "openart", amount: 240, allocation: 0.25, category: "PRODUCTION" },
        { id: "railway", amount: 100, allocation: 0.5, category: "ALPHI_INFRASTRUCTURE" },
      ],
    });
    expect(cost.toNumber()).toBe(1210);
  });

  it("includes attributable Alphi infrastructure for managed marketing", () => {
    const cost = calculateServiceEstimate({
      service: "MANAGED_MARKETING",
      labor: 500,
      directCosts: 0,
      overhead: 100,
      subscriptionCosts: [{ id: "railway", amount: 100, allocation: 0.5, category: "ALPHI_INFRASTRUCTURE" }],
    });
    expect(cost.toNumber()).toBe(650);
  });

  it("does not double count shared subscriptions in hybrid services", () => {
    const shared = { id: "creative-suite", amount: 100, allocation: 0.5, category: "CORPORATE" as const };
    expect(calculateCombinedServices([
      { service: "VISUAL_PRODUCTION", labor: 100, directCosts: 0, overhead: 0, subscriptionCosts: [shared] },
      { service: "MANAGED_MARKETING", labor: 200, directCosts: 0, overhead: 0, subscriptionCosts: [shared] },
    ]).toNumber()).toBe(350);
  });

  it("calculates credit overages separately from included credits", () => {
    const result = estimateCreditOverage({ plannedShots: 10, attemptsPerShot: 3, creditsPerAttempt: 500, includedCreditsAvailable: 10000, additionalCreditUnitCost: 0.002 });
    expect(result.plannedCredits.toNumber()).toBe(15000);
    expect(result.overageCredits.toNumber()).toBe(5000);
    expect(result.overageCost.toNumber()).toBe(10);
  });

  it("requires a permissioned and reasoned minimum-margin override", () => {
    const pricing = calculateQuote({ labor: 1000, directCosts: 0, allocatedOverhead: 0, contingencyRate: 0, quotedPrice: 1500 });
    expect(canApproveQuote(pricing, "SALES_ACCOUNT", "Customer request").allowed).toBe(false);
    expect(canApproveQuote(pricing, "SUPER_ADMIN").allowed).toBe(false);
    expect(canApproveQuote(pricing, "SUPER_ADMIN", "Strategic pilot approved by founder").allowed).toBe(true);
  });

  it("branches intake requirements by selected services", () => {
    const marketing = requirementsFor(["MANAGED_MARKETING"]).map((item) => item.key);
    expect(marketing).toContain("socialProfiles");
    expect(marketing).not.toContain("productionType");
    const status = calculateIntakeCompleteness(["MANAGED_MARKETING"], { businessName: "Acme", primaryObjective: "Leads", brandProfile: "Modern", socialProfiles: ["example"], approvalPreferences: "Weekly" });
    expect(status.readyForEstimate).toBe(true);
  });

  it("enforces tenant and client authorization boundaries", () => {
    const client: Principal = { userId: "u1", organizationId: "org1", role: "CLIENT", clientId: "client1" };
    expect(canAccessRecord(client, { organizationId: "org1", clientId: "client1" })).toBe(true);
    expect(canAccessRecord(client, { organizationId: "org1", clientId: "client2" })).toBe(false);
    expect(() => authorize(client, "pricing:read-internal")).toThrow("Forbidden");
  });

  it("creates a complete production blueprint from an accepted quote", () => {
    const project = projectBlueprintFromAcceptedQuote({ quoteId: "q1", title: "Launch", servicePath: "VISUAL_PRODUCTION", clientId: "c1" });
    expect(project.quoteId).toBe("q1");
    expect(project.milestones).toHaveLength(4);
    expect(project.approvals).toContain("FINAL_CUT");
  });

  it("enforces approval-driven production transitions", () => {
    expect(() => assertProjectTransition("SCRIPT_REVIEW", "VISUAL_DEVELOPMENT")).not.toThrow();
    expect(() => assertProjectTransition("SCRIPT_REVIEW", "DELIVERY")).toThrow("Invalid project transition");
  });

  it("derives invoice state without treating an open invoice as collected cash", () => {
    expect(invoiceStatus({ amount: 1000, paid: 0, dueAt: new Date("2026-01-01"), now: new Date("2026-01-02") })).toBe("OVERDUE");
    expect(invoiceStatus({ amount: 1000, paid: 300, dueAt: new Date("2026-01-01") })).toBe("PARTIALLY_PAID");
  });

  it("calculates speculative original-IP recoupment requirements", () => {
    const projection = calculateOriginalIpProjection({ productionCost: 100000, releaseCost: 20000, distributionDeductionRate: 0.2 });
    expect(projection.breakEvenGrossRevenue.toNumber()).toBe(150000);
    expect(projection.grossRevenueFor50Margin.toNumber()).toBe(300000);
    expect(projection.speculative).toBe(true);
  });
});
