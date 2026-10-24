import { OutboxStatus } from "@prisma/client";
import { retryDelayMs, type IntegrationOutcome } from "../integrations";

export function deliveryDisposition(outcome: IntegrationOutcome, attempt: number, maxAttempts = 5) {
  if (outcome.status === "CONFIRMED") {
    if (!outcome.externalId) throw new Error("Confirmed outcomes require an external ID");
    return { status: OutboxStatus.SUCCEEDED, externalId: outcome.externalId, detail: outcome.detail ?? null, delayMs: 0 };
  }
  const exhausted = attempt >= maxAttempts;
  if (outcome.status === "PENDING") {
    return {
      status: exhausted ? OutboxStatus.DEAD_LETTER : OutboxStatus.PENDING,
      externalId: null,
      detail: outcome.detail,
      delayMs: exhausted ? 0 : retryDelayMs(attempt),
    };
  }
  return {
    status: exhausted || !outcome.retryable ? OutboxStatus.DEAD_LETTER : OutboxStatus.FAILED,
    externalId: null,
    detail: outcome.detail,
    delayMs: exhausted || !outcome.retryable ? 0 : retryDelayMs(attempt),
  };
}
