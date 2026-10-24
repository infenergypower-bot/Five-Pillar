import { describe, expect, it, vi } from "vitest";
import { HttpJsonAdapter, UnconfiguredAdapter, retryDelayMs } from "./integrations";

describe("integration adapters", () => {
  it("keeps unconfigured external actions pending", async () => {
    const result = await new UnconfiguredAdapter("ALPHI").execute({
      idempotencyKey: "one",
      kind: "ALPHI",
      event: "production.approved",
      payload: {},
    });
    expect(result.status).toBe("PENDING");
  });

  it("requires an external identifier before confirming success", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })) as unknown as typeof fetch;
    const result = await new HttpJsonAdapter("EMAIL", "https://provider.example/send", "secret", fetcher).execute({
      idempotencyKey: "two",
      kind: "EMAIL",
      event: "proposal.send",
      payload: {},
    });
    expect(result.status).toBe("FAILED");
  });

  it("passes an idempotency key to configured providers", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ externalId: "provider-123" }), { status: 200 })) as unknown as typeof fetch;
    const result = await new HttpJsonAdapter("PAYMENT", "https://provider.example/invoice", "secret", fetcher).execute({
      idempotencyKey: "stable-key",
      kind: "PAYMENT",
      event: "invoice.create",
      payload: { amount: "100.00" },
    });
    expect(result.status).toBe("CONFIRMED");
    expect(fetcher).toHaveBeenCalledWith(
      "https://provider.example/invoice",
      expect.objectContaining({ headers: expect.objectContaining({ "idempotency-key": "stable-key" }) }),
    );
  });

  it("uses bounded exponential retry delays", () => {
    expect(retryDelayMs(1)).toBe(1000);
    expect(retryDelayMs(30)).toBe(3_600_000);
  });
});
