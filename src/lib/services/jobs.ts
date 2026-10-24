import { createHash, timingSafeEqual } from "node:crypto";
import { OutboxStatus, type IntegrationOutboxEvent, type EmailMessage, type Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import {
  HttpJsonAdapter,
  UnconfiguredAdapter,
  type IntegrationAdapter,
  type IntegrationKind,
  type IntegrationOutcome,
} from "@/lib/integrations";
import { ServiceError } from "./errors";
import { deliveryDisposition } from "./delivery";
import { decryptDeliveryPayload } from "./delivery-payload";

const MAX_ATTEMPTS = 5;
const MAX_BATCH = 50;

export function verifyJobRunnerSecret(candidate: string | null): boolean {
  const configured = process.env.JOB_RUNNER_SECRET;
  if (!configured || configured.length < 32 || !candidate) return false;
  const expected = createHash("sha256").update(configured).digest();
  const actual = createHash("sha256").update(candidate).digest();
  return timingSafeEqual(expected, actual);
}

function kindFor(provider: string | null, eventType: string): IntegrationKind {
  const value = `${provider ?? ""} ${eventType}`.toUpperCase();
  if (value.includes("EMAIL")) return "EMAIL";
  if (value.includes("SIGNATURE")) return "SIGNATURE";
  if (value.includes("PAYMENT") || value.includes("INVOICE")) return "PAYMENT";
  if (value.includes("STORAGE") || value.includes("ASSET")) return "STORAGE";
  if (value.includes("GENERATION")) return "GENERATION";
  return "ALPHI";
}

function defaultAdapter(kind: IntegrationKind): IntegrationAdapter {
  const config = env();
  if (kind === "EMAIL" && config.EMAIL_PROVIDER_URL && config.EMAIL_PROVIDER_API_KEY) {
    return new HttpJsonAdapter("EMAIL", config.EMAIL_PROVIDER_URL, config.EMAIL_PROVIDER_API_KEY);
  }
  if (kind === "ALPHI" && config.ALPHI_API_URL && config.ALPHI_API_KEY) {
    return new HttpJsonAdapter("ALPHI", config.ALPHI_API_URL, config.ALPHI_API_KEY);
  }
  return new UnconfiguredAdapter(kind);
}

function emailProviderConfigured(): boolean {
  try {
    const config = env();
    return Boolean(config.EMAIL_PROVIDER_URL && config.EMAIL_PROVIDER_API_KEY);
  } catch {
    return false;
  }
}

function objectPayload(value: Prisma.JsonValue | null): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : { value };
}

async function claimIntegrationEvent(): Promise<(IntegrationOutboxEvent & { provider: string | null }) | null> {
  return db.$transaction(async (tx) => {
    const event = await tx.integrationOutboxEvent.findFirst({
      where: {
        status: { in: [OutboxStatus.PENDING, OutboxStatus.FAILED] },
        attempts: { lt: MAX_ATTEMPTS },
        availableAt: { lte: new Date() },
      },
      include: { connection: { select: { provider: true } } },
      orderBy: [{ availableAt: "asc" }, { createdAt: "asc" }],
    });
    if (!event) return null;
    const claimed = await tx.integrationOutboxEvent.updateMany({
      where: { id: event.id, status: event.status, attempts: event.attempts },
      data: { status: OutboxStatus.PROCESSING, attempts: { increment: 1 } },
    });
    if (claimed.count !== 1) return null;
    const { connection, ...record } = event;
    return { ...record, attempts: event.attempts + 1, status: OutboxStatus.PROCESSING, provider: connection?.provider ?? null };
  });
}

async function claimEmail(): Promise<EmailMessage | null> {
  return db.$transaction(async (tx) => {
    const message = await tx.emailMessage.findFirst({
      where: { status: { in: [OutboxStatus.PENDING, OutboxStatus.FAILED] }, attempts: { lt: MAX_ATTEMPTS } },
      orderBy: { createdAt: "asc" },
    });
    if (!message) return null;
    const claimed = await tx.emailMessage.updateMany({
      where: { id: message.id, status: message.status, attempts: message.attempts },
      data: { status: OutboxStatus.PROCESSING, attempts: { increment: 1 } },
    });
    return claimed.count === 1
      ? { ...message, attempts: message.attempts + 1, status: OutboxStatus.PROCESSING }
      : null;
  });
}

async function processIntegrationEvent(
  event: IntegrationOutboxEvent & { provider: string | null },
  resolveAdapter: (kind: IntegrationKind) => IntegrationAdapter,
) {
  const kind = kindFor(event.provider, event.eventType);
  let outcome: IntegrationOutcome;
  try {
    outcome = await resolveAdapter(kind).execute({
      idempotencyKey: event.idempotencyKey,
      kind,
      event: event.eventType,
      payload: objectPayload(event.payload),
    });
  } catch (error) {
    outcome = { status: "FAILED", detail: error instanceof Error ? error.message : "Adapter execution failed", retryable: true };
  }
  const disposition = deliveryDisposition(outcome, event.attempts);
  const now = new Date();
  const payload = disposition.externalId
    ? { ...objectPayload(event.payload), _delivery: { externalId: disposition.externalId, confirmedAt: now.toISOString() } }
    : event.payload;
  await db.$transaction([
    db.integrationOutboxEvent.updateMany({
      where: { id: event.id, status: OutboxStatus.PROCESSING },
      data: {
        status: disposition.status,
        payload: payload as Prisma.InputJsonValue,
        processedAt: disposition.status === OutboxStatus.SUCCEEDED ? now : null,
        lastError: disposition.status === OutboxStatus.SUCCEEDED ? null : disposition.detail,
        availableAt: disposition.delayMs ? new Date(now.getTime() + disposition.delayMs) : event.availableAt,
      },
    }),
    db.auditEvent.create({
      data: {
        organizationId: event.organizationId,
        action: disposition.status === OutboxStatus.SUCCEEDED ? "outbox.confirmed" : "outbox.attempted",
        entityType: "IntegrationOutboxEvent",
        entityId: event.id,
        after: { status: disposition.status, attempt: event.attempts, externalId: disposition.externalId },
      },
    }),
  ]);
  return { type: "integration", id: event.id, status: disposition.status, externalId: disposition.externalId };
}

async function processEmail(
  message: EmailMessage,
  resolveAdapter: (kind: IntegrationKind) => IntegrationAdapter,
) {
  let outcome: IntegrationOutcome;
  try {
    outcome = await resolveAdapter("EMAIL").execute({
      idempotencyKey: `email:${message.id}`,
      kind: "EMAIL",
      event: "email.send",
      payload: {
        to: message.toAddresses,
        cc: message.ccAddresses,
        subject: message.subject,
        templateKey: message.templateKey,
        payload: decryptDeliveryPayload(message.payload),
      },
    });
  } catch (error) {
    outcome = { status: "FAILED", detail: error instanceof Error ? error.message : "Adapter execution failed", retryable: true };
  }
  const disposition = deliveryDisposition(outcome, message.attempts);
  const now = new Date();
  await db.$transaction([
    db.emailMessage.updateMany({
      where: { id: message.id, status: OutboxStatus.PROCESSING },
      data: {
        status: disposition.status,
        providerMessageId: disposition.externalId,
        sentAt: disposition.status === OutboxStatus.SUCCEEDED ? now : null,
        lastError: disposition.status === OutboxStatus.SUCCEEDED ? null : disposition.detail,
      },
    }),
    db.auditEvent.create({
      data: {
        organizationId: message.organizationId,
        action: disposition.status === OutboxStatus.SUCCEEDED ? "email.confirmed" : "email.attempted",
        entityType: "EmailMessage",
        entityId: message.id,
        after: { status: disposition.status, attempt: message.attempts, externalId: disposition.externalId },
      },
    }),
  ]);
  return { type: "email", id: message.id, status: disposition.status, externalId: disposition.externalId };
}

export async function processDueIntegrationWork(input: {
  limit?: number;
  resolveAdapter?: (kind: IntegrationKind) => IntegrationAdapter;
} = {}) {
  const limit = Math.min(MAX_BATCH, Math.max(1, input.limit ?? 10));
  const resolveAdapter = input.resolveAdapter ?? defaultAdapter;
  const canClaimEmail = Boolean(input.resolveAdapter) || emailProviderConfigured();
  const results: Array<{ type: string; id: string; status: OutboxStatus; externalId: string | null }> = [];
  for (let index = 0; index < limit; index += 1) {
    const event = await claimIntegrationEvent();
    const message = event || !canClaimEmail ? null : await claimEmail();
    if (!event && !message) break;
    results.push(event
      ? await processIntegrationEvent(event, resolveAdapter)
      : await processEmail(message!, resolveAdapter));
  }
  return { processed: results.length, results };
}

export function requireJobRunnerSecret(request: Request): void {
  const authorization = request.headers.get("authorization");
  const bearer = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!process.env.JOB_RUNNER_SECRET) throw new ServiceError("JOB_RUNNER_NOT_CONFIGURED", "Job runner is not configured", 503);
  if (!verifyJobRunnerSecret(request.headers.get("x-job-runner-secret") ?? bearer)) {
    throw new ServiceError("UNAUTHENTICATED", "Invalid job runner credential", 401);
  }
}
