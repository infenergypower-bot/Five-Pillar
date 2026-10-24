export type IntegrationKind = "EMAIL" | "SIGNATURE" | "PAYMENT" | "STORAGE" | "ALPHI" | "GENERATION";
export type IntegrationOutcome =
  | { status: "CONFIRMED"; externalId: string; detail?: string }
  | { status: "PENDING"; detail: string }
  | { status: "FAILED"; detail: string; retryable: boolean };

export interface IntegrationCommand {
  idempotencyKey: string;
  kind: IntegrationKind;
  event: string;
  payload: Record<string, unknown>;
}

export interface IntegrationAdapter {
  readonly kind: IntegrationKind;
  execute(command: IntegrationCommand): Promise<IntegrationOutcome>;
}

export class UnconfiguredAdapter implements IntegrationAdapter {
  constructor(public readonly kind: IntegrationKind) {}

  async execute(command: IntegrationCommand): Promise<IntegrationOutcome> {
    void command;
    return {
      status: "PENDING",
      detail: `${this.kind} provider is not configured. The operation remains pending and no external success was recorded.`,
    };
  }
}

export class HttpJsonAdapter implements IntegrationAdapter {
  constructor(
    public readonly kind: IntegrationKind,
    private readonly endpoint: string,
    private readonly apiKey: string,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  async execute(command: IntegrationCommand): Promise<IntegrationOutcome> {
    const response = await this.fetcher(this.endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        "content-type": "application/json",
        "idempotency-key": command.idempotencyKey,
      },
      body: JSON.stringify({ event: command.event, payload: command.payload }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      const detail = `Provider returned HTTP ${response.status}.`;
      return { status: "FAILED", detail, retryable: response.status === 408 || response.status === 429 || response.status >= 500 };
    }
    const result: unknown = await response.json();
    if (!result || typeof result !== "object" || !("externalId" in result) || typeof result.externalId !== "string") {
      return { status: "FAILED", detail: "Provider response did not include a confirmed external identifier.", retryable: false };
    }
    return { status: "CONFIRMED", externalId: result.externalId };
  }
}

export function retryDelayMs(attempt: number): number {
  if (!Number.isInteger(attempt) || attempt < 1) throw new Error("Attempt must be a positive integer.");
  return Math.min(60 * 60 * 1000, 1000 * 2 ** Math.min(attempt - 1, 12));
}
