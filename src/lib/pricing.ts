import Decimal from "decimal.js";

export type MoneyInput = Decimal.Value;

export interface QuoteCostInput {
  labor: MoneyInput;
  directCosts: MoneyInput;
  allocatedOverhead: MoneyInput;
  contingencyRate: MoneyInput;
  discount?: MoneyInput;
  quotedPrice?: MoneyInput;
}

export interface LaborLine {
  hours: MoneyInput;
  hourlyCost: MoneyInput;
}

export interface SubscriptionCost {
  id: string;
  amount: MoneyInput;
  allocation: MoneyInput;
  category: "CORPORATE" | "PRODUCTION" | "ALPHI_INFRASTRUCTURE" | "MARKETING" | "OTHER";
}

export interface ServiceEstimate {
  service: "VISUAL_PRODUCTION" | "MANAGED_MARKETING";
  labor: MoneyInput;
  directCosts: MoneyInput;
  subscriptionCosts: SubscriptionCost[];
  overhead: MoneyInput;
}

export interface CreditEstimate {
  plannedShots: number;
  attemptsPerShot: number;
  creditsPerAttempt: MoneyInput;
  includedCreditsAvailable: MoneyInput;
  additionalCreditUnitCost?: MoneyInput;
}

export interface OriginalIpProjectionInput {
  productionCost: MoneyInput;
  releaseCost: MoneyInput;
  distributionDeductionRate: MoneyInput;
  partnerParticipationRate?: MoneyInput;
}

export interface QuotePricing {
  allInCost: Decimal;
  contingency: Decimal;
  finalPrice: Decimal;
  operatingProfit: Decimal;
  operatingMargin: Decimal;
  minimumPrice: Decimal;
  recommendedPrice: Decimal;
  premiumPrice: Decimal;
  requiresOverride: boolean;
}

export function priceForMargin(cost: MoneyInput, margin: MoneyInput): Decimal {
  const safeCost = new Decimal(cost);
  const safeMargin = new Decimal(margin);
  if (safeCost.isNegative()) throw new Error("Cost cannot be negative.");
  if (safeMargin.isNegative() || safeMargin.gte(1)) throw new Error("Margin must be between 0 and 1.");
  return safeCost.div(new Decimal(1).minus(safeMargin)).toDecimalPlaces(2);
}

export function calculateQuote(input: QuoteCostInput): QuotePricing {
  const baseCost = new Decimal(input.labor).plus(input.directCosts).plus(input.allocatedOverhead);
  if (baseCost.isNegative()) throw new Error("All-in base cost cannot be negative.");
  const contingencyRate = new Decimal(input.contingencyRate);
  if (contingencyRate.isNegative()) throw new Error("Contingency cannot be negative.");
  const contingency = baseCost.times(contingencyRate).toDecimalPlaces(2);
  const allInCost = baseCost.plus(contingency).toDecimalPlaces(2);
  const grossPrice = input.quotedPrice === undefined ? priceForMargin(allInCost, 0.55) : new Decimal(input.quotedPrice);
  const discount = new Decimal(input.discount ?? 0);
  if (discount.isNegative() || discount.gt(grossPrice)) throw new Error("Discount must be between zero and the quoted price.");
  const finalPrice = grossPrice.minus(discount).toDecimalPlaces(2);
  const operatingProfit = finalPrice.minus(allInCost).toDecimalPlaces(2);
  const operatingMargin = finalPrice.isZero() ? new Decimal(0) : operatingProfit.div(finalPrice).toDecimalPlaces(4);
  return {
    allInCost,
    contingency,
    finalPrice,
    operatingProfit,
    operatingMargin,
    minimumPrice: priceForMargin(allInCost, 0.5),
    recommendedPrice: priceForMargin(allInCost, 0.55),
    premiumPrice: priceForMargin(allInCost, 0.6),
    requiresOverride: operatingMargin.lt(0.5),
  };
}

export function calculateLabor(lines: LaborLine[]): Decimal {
  return lines.reduce((total, line) => {
    const hours = new Decimal(line.hours);
    const rate = new Decimal(line.hourlyCost);
    if (hours.isNegative() || rate.isNegative()) throw new Error("Labor hours and rates cannot be negative.");
    return total.plus(hours.times(rate));
  }, new Decimal(0)).toDecimalPlaces(2);
}

function subscriptionAmount(subscription: SubscriptionCost): Decimal {
  const amount = new Decimal(subscription.amount);
  const allocation = new Decimal(subscription.allocation);
  if (amount.isNegative()) throw new Error("Subscription amount cannot be negative.");
  if (allocation.isNegative() || allocation.gt(1)) throw new Error("Subscription allocation must be between 0 and 1.");
  return amount.times(allocation).toDecimalPlaces(2);
}

export function calculateServiceEstimate(estimate: ServiceEstimate): Decimal {
  const subscriptions = estimate.subscriptionCosts.reduce((total, subscription) => {
    if (
      estimate.service === "VISUAL_PRODUCTION" &&
      (subscription.category === "ALPHI_INFRASTRUCTURE" || subscription.category === "MARKETING")
    ) {
      return total;
    }
    return total.plus(subscriptionAmount(subscription));
  }, new Decimal(0));

  return new Decimal(estimate.labor)
    .plus(estimate.directCosts)
    .plus(estimate.overhead)
    .plus(subscriptions)
    .toDecimalPlaces(2);
}

export function calculateCombinedServices(estimates: ServiceEstimate[]): Decimal {
  const allocatedSubscriptions = new Set<string>();
  let total = new Decimal(0);
  for (const estimate of estimates) {
    total = total.plus(estimate.labor).plus(estimate.directCosts).plus(estimate.overhead);
    for (const subscription of estimate.subscriptionCosts) {
      if (
        estimate.service === "VISUAL_PRODUCTION" &&
        (subscription.category === "ALPHI_INFRASTRUCTURE" || subscription.category === "MARKETING")
      ) {
        continue;
      }
      if (!allocatedSubscriptions.has(subscription.id)) {
        total = total.plus(subscriptionAmount(subscription));
        allocatedSubscriptions.add(subscription.id);
      }
    }
  }
  return total.toDecimalPlaces(2);
}

export function estimateCreditOverage(input: CreditEstimate) {
  if (!Number.isInteger(input.plannedShots) || input.plannedShots < 0) throw new Error("Planned shots must be a non-negative integer.");
  if (!Number.isInteger(input.attemptsPerShot) || input.attemptsPerShot < 0) throw new Error("Attempts per shot must be a non-negative integer.");
  const plannedCredits = new Decimal(input.plannedShots).times(input.attemptsPerShot).times(input.creditsPerAttempt);
  const overageCredits = Decimal.max(plannedCredits.minus(input.includedCreditsAvailable), 0);
  const overageCost = overageCredits.times(input.additionalCreditUnitCost ?? 0);
  return {
    plannedCredits: plannedCredits.toDecimalPlaces(0),
    overageCredits: overageCredits.toDecimalPlaces(0),
    overageCost: overageCost.toDecimalPlaces(2),
  };
}

export function calculateOriginalIpProjection(input: OriginalIpProjectionInput) {
  const totalCost = new Decimal(input.productionCost).plus(input.releaseCost);
  const distributionRate = new Decimal(input.distributionDeductionRate);
  const participationRate = new Decimal(input.partnerParticipationRate ?? 0);
  const retainedRate = new Decimal(1).minus(distributionRate).minus(participationRate);
  if (totalCost.isNegative()) throw new Error("Original IP costs cannot be negative.");
  if (retainedRate.lte(0) || retainedRate.gt(1)) throw new Error("Net retained rate must be greater than zero and no more than one.");
  const grossForNet = (netRequired: Decimal) => netRequired.div(retainedRate).toDecimalPlaces(2);
  return {
    totalCost: totalCost.toDecimalPlaces(2),
    retainedRate,
    breakEvenGrossRevenue: grossForNet(totalCost),
    grossRevenueFor50Margin: grossForNet(priceForMargin(totalCost, 0.5)),
    grossRevenueFor55Margin: grossForNet(priceForMargin(totalCost, 0.55)),
    grossRevenueFor60Margin: grossForNet(priceForMargin(totalCost, 0.6)),
    speculative: true as const,
  };
}

export function canApproveQuote(
  pricing: QuotePricing,
  actorRole: string,
  overrideReason?: string,
): { allowed: boolean; requiresAuditedOverride: boolean; reason?: string } {
  if (!pricing.requiresOverride) return { allowed: true, requiresAuditedOverride: false };
  const canOverride = actorRole === "SUPER_ADMIN" || actorRole === "FINANCE";
  if (!canOverride) {
    return { allowed: false, requiresAuditedOverride: true, reason: "Quote is below the configured minimum margin." };
  }
  if (!overrideReason?.trim()) {
    return { allowed: false, requiresAuditedOverride: true, reason: "An override reason is required and will be audited." };
  }
  return { allowed: true, requiresAuditedOverride: true };
}
