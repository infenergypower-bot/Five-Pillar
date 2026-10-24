import { describe, expect, it } from "vitest";
import { OutboxStatus } from "@prisma/client";
import { deliveryDisposition } from "./delivery";

describe("integration delivery disposition", () => {
  it("requires provider confirmation with an external identifier", () => {
    expect(deliveryDisposition({ status: "CONFIRMED", externalId: "provider-42" }, 1)).toMatchObject({
      status: OutboxStatus.SUCCEEDED,
      externalId: "provider-42",
    });
  });

  it("keeps retryable outcomes due with backoff before the bound", () => {
    const result = deliveryDisposition({ status: "FAILED", detail: "timeout", retryable: true }, 2);
    expect(result.status).toBe(OutboxStatus.FAILED);
    expect(result.delayMs).toBeGreaterThan(0);
    expect(result.externalId).toBeNull();
  });

  it("dead-letters unconfirmed work at the retry bound", () => {
    expect(deliveryDisposition({ status: "PENDING", detail: "not configured" }, 5).status).toBe(OutboxStatus.DEAD_LETTER);
    expect(deliveryDisposition({ status: "FAILED", detail: "bad request", retryable: false }, 1).status).toBe(OutboxStatus.DEAD_LETTER);
  });
});
