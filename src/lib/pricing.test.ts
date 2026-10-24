import { describe, expect, it } from "vitest";
import { calculateQuote, priceForMargin } from "./pricing";

describe("pricing engine", () => {
  it("uses margin rather than markup", () => {
    expect(priceForMargin(1000, 0.5).toNumber()).toBe(2000);
    expect(priceForMargin(1000, 0.55).toNumber()).toBe(2222.22);
  });

  it("includes overhead and contingency before calculating targets", () => {
    const quote = calculateQuote({ labor: 1000, directCosts: 500, allocatedOverhead: 200, contingencyRate: 0.1 });
    expect(quote.contingency.toNumber()).toBe(170);
    expect(quote.allInCost.toNumber()).toBe(1870);
    expect(quote.recommendedPrice.toNumber()).toBe(4155.56);
  });

  it("flags prices below the minimum operating margin", () => {
    const quote = calculateQuote({ labor: 1000, directCosts: 0, allocatedOverhead: 0, contingencyRate: 0, quotedPrice: 1900 });
    expect(quote.operatingMargin.toNumber()).toBeCloseTo(0.4737);
    expect(quote.requiresOverride).toBe(true);
  });

  it("applies discounts to final price without changing costs", () => {
    const quote = calculateQuote({ labor: 1000, directCosts: 0, allocatedOverhead: 0, contingencyRate: 0, quotedPrice: 2500, discount: 100 });
    expect(quote.finalPrice.toNumber()).toBe(2400);
    expect(quote.allInCost.toNumber()).toBe(1000);
  });
});
