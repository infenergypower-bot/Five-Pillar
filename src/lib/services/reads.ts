import type { AuthPrincipal } from "@/lib/auth";
import { db } from "@/lib/db";
import { ServiceError } from "./errors";
import { guard, money, nextCursor } from "./helpers";
import { paginationSchema } from "./inputs";

type PageInput = { cursor?: string; limit?: number | string };

function page(raw: PageInput) {
  return paginationSchema.parse(raw);
}

function missing(label: string): never {
  throw new ServiceError("NOT_FOUND", `${label} not found`, 404);
}

function portalOr(principal: AuthPrincipal, permission: Parameters<typeof guard>[1], scope: Parameters<typeof guard>[2]) {
  guard(principal, principal.role === "CLIENT" ? "portal:read" : permission, scope);
}

export async function getLead(principal: AuthPrincipal, id: string) {
  guard(principal, "crm:read");
  const record = await db.lead.findFirst({
    where: { id, organizationId: principal.organizationId },
    select: {
      id: true, businessName: true, contactName: true, email: true, phone: true, source: true,
      stage: true, serviceInterests: true, opportunityValue: true, currency: true, nextFollowUpAt: true,
      lostReason: true, createdAt: true, updatedAt: true,
      owner: { select: { id: true, name: true } },
      stageHistory: { select: { id: true, fromStage: true, toStage: true, reason: true, changedAt: true }, orderBy: { changedAt: "desc" } },
      activities: { select: { id: true, type: true, subject: true, body: true, occurredAt: true, nextActionAt: true }, orderBy: { occurredAt: "desc" } },
    },
  });
  if (!record) missing("Lead");
  return { ...record, opportunityValue: record.opportunityValue?.toString() ?? null };
}

export async function getClient(principal: AuthPrincipal, id: string) {
  portalOr(principal, "crm:read", { organizationId: principal.organizationId, clientId: id });
  const record = await db.client.findFirst({
    where: {
      id,
      organizationId: principal.organizationId,
      ...(principal.role === "CLIENT" ? { id: principal.clientId ?? "__none__" } : {}),
    },
    select: {
      id: true, legalName: true, displayName: true, website: true, industry: true, businessType: true,
      timezone: true, createdAt: true, updatedAt: true,
      contacts: { select: { id: true, name: true, email: true, phone: true, title: true, isPrimary: true, canApproveSpend: true, canApproveCreative: true } },
      brands: { select: { id: true, name: true, profile: true } },
      products: { select: { id: true, name: true, description: true, sku: true, price: true, currency: true, active: true } },
      intakes: { select: { id: true, servicePath: true, status: true, completeness: true, readinessStatus: true, updatedAt: true }, orderBy: { updatedAt: "desc" } },
      quotes: { select: { id: true, projectTitle: true, servicePath: true, status: true, currency: true, currentVersion: true, updatedAt: true }, orderBy: { updatedAt: "desc" } },
      proposals: { select: { id: true, status: true, currentVersion: true, createdAt: true, quote: { select: { projectTitle: true } } }, orderBy: { createdAt: "desc" } },
      contracts: { select: { id: true, number: true, title: true, status: true, signedAt: true, updatedAt: true }, orderBy: { updatedAt: "desc" } },
      projects: { select: { id: true, title: true, servicePath: true, status: true, dueAt: true }, orderBy: { updatedAt: "desc" } },
      invoices: { select: { id: true, number: true, status: true, currency: true, total: true, amountPaid: true, dueAt: true }, orderBy: { createdAt: "desc" } },
      serviceSubscriptions: { select: { id: true, packageName: true, status: true, monthlyFee: true, currency: true, startsAt: true, endsAt: true }, orderBy: { startsAt: "desc" } },
    },
  });
  if (!record) missing("Client");
  return {
    ...record,
    products: record.products.map((product) => ({ ...product, price: product.price?.toString() ?? null })),
    proposals: record.proposals.map(({ quote, ...proposal }) => ({ ...proposal, projectTitle: quote.projectTitle })),
    invoices: record.invoices.map((invoice) => ({ ...invoice, total: money(invoice.total), amountPaid: money(invoice.amountPaid) })),
    serviceSubscriptions: record.serviceSubscriptions.map((subscription) => ({ ...subscription, monthlyFee: money(subscription.monthlyFee) })),
  };
}

export async function getIntake(principal: AuthPrincipal, id: string) {
  const record = await db.intake.findFirst({
    where: { id, questionnaireVersion: { definition: { organizationId: principal.organizationId } } },
    select: {
      id: true, clientId: true, questionnaireVersionId: true, version: true, servicePath: true, status: true,
      completeness: true, readiness: true, submittedAt: true, createdAt: true, updatedAt: true,
      client: { select: { displayName: true, organizationId: true } },
      answers: {
        where: principal.role === "CLIENT" ? { question: { internalOnly: false } } : undefined,
        select: {
          id: true, value: true, isDraft: true, answeredAt: true,
          question: { select: { key: true, label: true, type: true, internalOnly: true } },
        },
      },
      serviceSelections: { select: { id: true, servicePath: true, configuration: true } },
      briefs: { select: { id: true, title: true, objectives: true, audience: true, creativeDirection: true, productionRequirements: true, sourceMaterials: true, rightsRequirements: true, approvedAt: true } },
    },
  });
  if (!record) missing("Intake");
  portalOr(principal, "production:read", { organizationId: principal.organizationId, clientId: record.clientId });
  return record;
}

export async function getQuote(principal: AuthPrincipal, id: string) {
  const record = await db.quote.findFirst({
    where: { id, organizationId: principal.organizationId },
    select: {
      id: true, clientId: true, packageId: true, projectTitle: true, servicePath: true, status: true,
      currency: true, currentVersion: true, expiresAt: true, acceptedAt: true, createdAt: true, updatedAt: true,
      client: { select: { displayName: true } },
      versions: {
        select: {
          id: true, version: true, status: true, configuration: true, subtotal: true, discount: true,
          finalPrice: true, approvedAt: true, createdAt: true,
          lines: {
            where: { internalOnly: false },
            select: { id: true, category: true, description: true, quantity: true, clientUnitPrice: true, currency: true, servicePath: true, sortOrder: true },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { version: "desc" },
      },
    },
  });
  if (!record) missing("Quote");
  portalOr(principal, "crm:read", { organizationId: principal.organizationId, clientId: record.clientId });
  return {
    ...record,
    versions: record.versions.map((version) => ({
      ...version,
      subtotal: money(version.subtotal), discount: money(version.discount), finalPrice: money(version.finalPrice),
      lines: version.lines.map((line) => ({ ...line, quantity: money(line.quantity), clientUnitPrice: line.clientUnitPrice?.toString() ?? null })),
    })),
  };
}

export async function getProject(principal: AuthPrincipal, id: string) {
  const record = await db.project.findFirst({
    where: { id, organizationId: principal.organizationId },
    select: {
      id: true, clientId: true, quoteId: true, originalTitleId: true, title: true, servicePath: true,
      status: true, currency: true, budget: true, startAt: true, dueAt: true, createdAt: true, updatedAt: true,
      client: { select: { displayName: true } },
      team: { select: { projectRole: true, joinedAt: true, user: { select: { id: true, name: true } } } },
      milestones: { select: { id: true, name: true, status: true, dueAt: true, completedAt: true, sortOrder: true }, orderBy: { sortOrder: "asc" } },
      tasks: { select: { id: true, title: true, status: true, priority: true, dueAt: true, completedAt: true, assignee: { select: { id: true, name: true } } } },
      approvals: { select: { id: true, type: true, status: true, reason: true, requestedAt: true, decidedAt: true } },
      deliverables: { select: { id: true, name: true, format: true, aspectRatio: true, resolution: true, status: true, releasedAt: true, acceptedAt: true } },
    },
  });
  if (!record) missing("Project");
  portalOr(principal, "production:read", { organizationId: principal.organizationId, clientId: record.clientId, projectId: record.id });
  return { ...record, budget: record.budget?.toString() ?? null };
}

export async function getInvoice(principal: AuthPrincipal, id: string) {
  const record = await db.invoice.findFirst({
    where: { id, organizationId: principal.organizationId },
    select: {
      id: true, clientId: true, projectId: true, number: true, status: true, currency: true, subtotal: true,
      tax: true, total: true, amountPaid: true, dueAt: true, paidAt: true, createdAt: true, updatedAt: true,
      client: { select: { displayName: true } },
      lines: { select: { id: true, description: true, quantity: true, unitPrice: true, amount: true } },
      payments: { select: { id: true, status: true, amount: true, currency: true, receivedAt: true, createdAt: true } },
    },
  });
  if (!record) missing("Invoice");
  portalOr(principal, "finance:read", { organizationId: principal.organizationId, clientId: record.clientId, projectId: record.projectId });
  return {
    ...record,
    subtotal: money(record.subtotal), tax: money(record.tax), total: money(record.total), amountPaid: money(record.amountPaid),
    lines: record.lines.map((line) => ({ ...line, quantity: money(line.quantity), unitPrice: money(line.unitPrice), amount: money(line.amount) })),
    payments: record.payments.map((payment) => ({ ...payment, amount: money(payment.amount) })),
  };
}

export async function getOriginalTitle(principal: AuthPrincipal, id: string) {
  guard(principal, "production:read");
  if (principal.role === "EXTERNAL_COLLABORATOR") throw new ServiceError("FORBIDDEN", "You do not have access to original IP records", 403);
  const record = await db.originalTitle.findFirst({
    where: { id, organizationId: principal.organizationId },
    include: {
      rights: true,
      financingSources: { include: { contributions: true } },
      distributionAssumptions: true,
      recoupmentTiers: true,
      projections: true,
      projects: { select: { id: true, title: true, status: true } },
    },
  });
  if (!record) missing("Original title");
  return record;
}

export async function listProposals(principal: AuthPrincipal, raw: PageInput = {}) {
  const input = page(raw);
  portalOr(principal, "crm:read", { organizationId: principal.organizationId, clientId: principal.clientId });
  const rows = await db.proposal.findMany({
    where: { organizationId: principal.organizationId, ...(principal.role === "CLIENT" ? { clientId: principal.clientId ?? "__none__" } : {}) },
    select: {
      id: true, clientId: true, quoteId: true, status: true, currentVersion: true, expiresAt: true, createdAt: true,
      quote: { select: { projectTitle: true } }, client: { select: { displayName: true } },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: input.limit,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  return nextCursor(rows.map(({ quote, client, ...record }) => ({ ...record, projectTitle: quote.projectTitle, client: client?.displayName ?? null })), input.limit);
}

export async function getProposal(principal: AuthPrincipal, id: string) {
  const record = await db.proposal.findFirst({
    where: { id, organizationId: principal.organizationId },
    select: {
      id: true, clientId: true, quoteId: true, status: true, currentVersion: true, expiresAt: true, createdAt: true,
      quote: { select: { projectTitle: true, servicePath: true, currency: true } },
      client: { select: { displayName: true } },
      versions: { select: { id: true, version: true, templateKey: true, sections: true, renderedDocumentUrl: true, createdAt: true }, orderBy: { version: "desc" } },
      acceptances: { select: { id: true, accepted: true, name: true, email: true, acceptedAt: true }, orderBy: { acceptedAt: "desc" } },
    },
  });
  if (!record) missing("Proposal");
  portalOr(principal, "crm:read", { organizationId: principal.organizationId, clientId: record.clientId });
  return record;
}

export async function listContracts(principal: AuthPrincipal, raw: PageInput = {}) {
  const input = page(raw);
  portalOr(principal, "crm:read", { organizationId: principal.organizationId, clientId: principal.clientId });
  const rows = await db.contract.findMany({
    where: { organizationId: principal.organizationId, ...(principal.role === "CLIENT" ? { clientId: principal.clientId ?? "__none__" } : {}) },
    select: { id: true, clientId: true, projectId: true, number: true, title: true, status: true, effectiveAt: true, expiresAt: true, signedAt: true, client: { select: { displayName: true } } },
    orderBy: { id: "asc" }, take: input.limit,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  return nextCursor(rows.map(({ client, ...record }) => ({ ...record, client: client?.displayName ?? null })), input.limit);
}

export async function getContract(principal: AuthPrincipal, id: string) {
  const record = await db.contract.findFirst({
    where: { id, organizationId: principal.organizationId },
    select: {
      id: true, clientId: true, projectId: true, proposalId: true, number: true, title: true, status: true,
      effectiveAt: true, expiresAt: true, signedAt: true, signatureProvider: true, createdAt: true, updatedAt: true,
      client: { select: { displayName: true } },
      versions: { select: { id: true, version: true, body: true, documentUrl: true, createdAt: true }, orderBy: { version: "desc" } },
      paymentSchedules: { select: { id: true, label: true, percentage: true, amount: true, dueTrigger: true, sortOrder: true }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!record) missing("Contract");
  portalOr(principal, "crm:read", { organizationId: principal.organizationId, clientId: record.clientId, projectId: record.projectId });
  return {
    ...record,
    paymentSchedules: record.paymentSchedules.map((schedule) => ({ ...schedule, percentage: schedule.percentage?.toString() ?? null, amount: schedule.amount?.toString() ?? null })),
  };
}

export async function listTasks(principal: AuthPrincipal, raw: PageInput = {}) {
  guard(principal, "production:read");
  const input = page(raw);
  const rows = await db.task.findMany({
    where: {
      project: { organizationId: principal.organizationId },
      ...(principal.role === "EXTERNAL_COLLABORATOR" ? { projectId: { in: [...(principal.assignedProjectIds ?? [])] } } : {}),
    },
    select: { id: true, projectId: true, title: true, status: true, priority: true, dueAt: true, completedAt: true, project: { select: { title: true } }, assignee: { select: { id: true, name: true } } },
    orderBy: { id: "asc" }, take: input.limit,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  return nextCursor(rows.map(({ project, assignee, ...record }) => ({ ...record, project: project.title, assignee: assignee?.name ?? null })), input.limit);
}

export async function getTask(principal: AuthPrincipal, id: string) {
  const record = await db.task.findUnique({
    where: { id },
    select: {
      id: true, projectId: true, milestoneId: true, title: true, description: true, status: true, priority: true,
      estimatedHours: true, actualHours: true, dueAt: true, completedAt: true, createdAt: true,
      project: { select: { organizationId: true, clientId: true, title: true } },
      milestone: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
    },
  });
  if (!record) missing("Task");
  guard(principal, "production:read", { organizationId: record.project.organizationId, clientId: record.project.clientId, projectId: record.projectId });
  return { ...record, estimatedHours: record.estimatedHours?.toString() ?? null, actualHours: record.actualHours?.toString() ?? null };
}

export async function listReviews(principal: AuthPrincipal, raw: PageInput = {}) {
  const input = page(raw);
  if (principal.role === "CLIENT") {
    guard(principal, "portal:read", { organizationId: principal.organizationId, clientId: principal.clientId });
  } else {
    guard(principal, "production:read");
  }
  const rows = await db.approval.findMany({
    where: {
      project: {
        organizationId: principal.organizationId,
        ...(principal.role === "CLIENT" ? { clientId: principal.clientId ?? "__none__" } : {}),
        ...(principal.role === "EXTERNAL_COLLABORATOR" ? { id: { in: [...(principal.assignedProjectIds ?? [])] } } : {}),
      },
    },
    select: { id: true, projectId: true, reviewId: true, type: true, status: true, requestedAt: true, decidedAt: true, project: { select: { title: true } } },
    orderBy: { id: "asc" }, take: input.limit,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  return nextCursor(rows.map(({ project, ...record }) => ({ ...record, project: project.title })), input.limit);
}

export async function getReview(principal: AuthPrincipal, id: string) {
  const record = await db.approval.findUnique({
    where: { id },
    select: {
      id: true, projectId: true, reviewId: true, type: true, status: true, requestedFromId: true,
      decidedById: true, reason: true, requestedAt: true, decidedAt: true,
      project: { select: { organizationId: true, clientId: true, title: true } },
      review: { select: { id: true, round: true, status: true, dueAt: true, completedAt: true, comments: { select: { id: true, body: true, timecodeSeconds: true, resolvedAt: true, createdAt: true } } } },
    },
  });
  if (!record) missing("Review");
  portalOr(principal, "production:read", { organizationId: record.project.organizationId, clientId: record.project.clientId, projectId: record.projectId });
  return record;
}

export async function listAssets(principal: AuthPrincipal, raw: PageInput = {}) {
  const input = page(raw);
  if (principal.role === "CLIENT") {
    guard(principal, "portal:read", { organizationId: principal.organizationId, clientId: principal.clientId });
  } else {
    guard(principal, "production:read");
  }
  const rows = await db.asset.findMany({
    where: {
      ownerOrganizationId: principal.organizationId,
      ...(principal.role === "CLIENT" ? { clientId: principal.clientId ?? "__none__" } : {}),
      ...(principal.role === "EXTERNAL_COLLABORATOR" ? { projectId: { in: [...(principal.assignedProjectIds ?? [])] } } : {}),
    },
    select: { id: true, projectId: true, clientId: true, category: true, name: true, mimeType: true, sizeBytes: true, version: true, status: true, approvalStatus: true, createdAt: true, project: { select: { title: true } } },
    orderBy: { id: "asc" }, take: input.limit,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  return nextCursor(rows.map(({ project, ...record }) => ({ ...record, sizeBytes: record.sizeBytes.toString(), project: project?.title ?? null })), input.limit);
}

export async function getAsset(principal: AuthPrincipal, id: string) {
  const record = await db.asset.findFirst({
    where: { id, ownerOrganizationId: principal.organizationId },
    select: {
      id: true, projectId: true, clientId: true, category: true, name: true, storageKey: true, mimeType: true,
      sizeBytes: true, checksum: true, version: true, status: true, approvalStatus: true, metadata: true, createdAt: true,
      project: { select: { organizationId: true, clientId: true, title: true } },
      rights: { select: { id: true, status: true, ownerName: true, permissionType: true, territories: true, channels: true, exclusive: true, startsAt: true, expiresAt: true, restrictions: true } },
    },
  });
  if (!record) missing("Asset");
  portalOr(principal, "production:read", { organizationId: principal.organizationId, clientId: record.clientId, projectId: record.projectId });
  const { storageKey, checksum, ...safe } = record;
  return principal.role === "CLIENT"
    ? { ...safe, sizeBytes: safe.sizeBytes.toString() }
    : { ...safe, storageKey, checksum, sizeBytes: safe.sizeBytes.toString() };
}

export async function listSubscriptions(principal: AuthPrincipal, raw: PageInput = {}) {
  guard(principal, "finance:read");
  const input = page(raw);
  const rows = await db.subscription.findMany({
    where: { organizationId: principal.organizationId },
    select: { id: true, provider: true, name: true, billingPeriod: true, amount: true, currency: true, division: true, allocationMethod: true, includedCredits: true, renewalAt: true, effectiveFrom: true, effectiveTo: true, active: true },
    orderBy: { id: "asc" }, take: input.limit,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  return nextCursor(rows.map((record) => ({ ...record, amount: money(record.amount) })), input.limit);
}

export async function getSubscription(principal: AuthPrincipal, id: string) {
  guard(principal, "finance:read");
  const record = await db.subscription.findFirst({
    where: { id, organizationId: principal.organizationId },
    include: { allocations: true, creditEntries: { orderBy: { createdAt: "desc" }, take: 100 } },
  });
  if (!record) missing("Subscription");
  return record;
}

export async function listCosts(principal: AuthPrincipal, raw: PageInput = {}) {
  guard(principal, "pricing:read-internal");
  const input = page(raw);
  const rows = await db.expense.findMany({
    where: { organizationId: principal.organizationId },
    select: { id: true, projectId: true, category: true, description: true, amount: true, currency: true, incurredAt: true, billable: true, project: { select: { title: true } } },
    orderBy: { id: "asc" }, take: input.limit,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  return nextCursor(rows.map(({ project, ...record }) => ({
    ...record, id: `expense:${record.id}`, project: project?.title ?? null,
    plannedAmount: null, actualAmount: money(record.amount),
  })), input.limit);
}

export async function getCost(principal: AuthPrincipal, id: string) {
  guard(principal, "pricing:read-internal");
  const [kind, recordId] = id.split(":", 2);
  if (kind !== "expense" || !recordId) missing("Cost");
  const record = await db.expense.findFirst({ where: { id: recordId, organizationId: principal.organizationId }, include: { project: { select: { id: true, title: true } } } });
  if (!record) missing("Cost");
  return { ...record, amount: money(record.amount) };
}

export async function listReports(principal: AuthPrincipal, raw: PageInput = {}) {
  guard(principal, "finance:read");
  const input = page(raw);
  const [invoices, projects, leads] = await Promise.all([
    db.invoice.aggregate({ where: { organizationId: principal.organizationId }, _sum: { total: true, amountPaid: true } }),
    db.project.aggregate({ where: { organizationId: principal.organizationId }, _sum: { budget: true, actualCost: true }, _count: { _all: true } }),
    db.lead.aggregate({ where: { organizationId: principal.organizationId }, _sum: { opportunityValue: true }, _count: { _all: true } }),
  ]);
  const period = new Date().toISOString().slice(0, 7);
  const records = [
    { id: "billed-revenue", metric: "Billed revenue", period, planned: null, actual: invoices._sum.total?.toString() ?? "0", variance: null },
    { id: "collected-cash", metric: "Collected cash", period, planned: invoices._sum.total?.toString() ?? "0", actual: invoices._sum.amountPaid?.toString() ?? "0", variance: null },
    { id: "project-cost", metric: "Project actual cost", period, planned: projects._sum.budget?.toString() ?? "0", actual: projects._sum.actualCost?.toString() ?? "0", variance: null },
    { id: "pipeline", metric: "Pipeline value", period, planned: leads._count._all.toString(), actual: leads._sum.opportunityValue?.toString() ?? "0", variance: null },
  ];
  const start = input.cursor ? Math.max(0, records.findIndex((item) => item.id === input.cursor) + 1) : 0;
  return nextCursor(records.slice(start, start + input.limit), input.limit);
}

export async function getReport(principal: AuthPrincipal, id: string) {
  const result = await listReports(principal, { limit: 100 });
  const record = result.items.find((item) => item.id === id);
  return record ?? missing("Report");
}

export async function listCreative(principal: AuthPrincipal, raw: PageInput = {}) {
  guard(principal, "production:read");
  const input = page(raw);
  const rows = await db.productionBible.findMany({
    where: {
      project: {
        organizationId: principal.organizationId,
        ...(principal.role === "EXTERNAL_COLLABORATOR" ? { id: { in: [...(principal.assignedProjectIds ?? [])] } } : {}),
      },
    },
    select: { id: true, projectId: true, title: true, currentVersion: true, lockedAt: true, approvedAt: true, project: { select: { title: true } } },
    orderBy: { id: "asc" }, take: input.limit,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  return nextCursor(rows.map(({ project, currentVersion, approvedAt, ...record }) => ({
    ...record, project: project.title, version: currentVersion, approvalStatus: approvedAt ? "APPROVED" : "PENDING", updatedAt: approvedAt ?? record.lockedAt,
  })), input.limit);
}

export async function getCreative(principal: AuthPrincipal, id: string) {
  const record = await db.productionBible.findUnique({
    where: { id },
    include: { project: { select: { organizationId: true, clientId: true, title: true } }, versions: { orderBy: { version: "desc" } } },
  });
  if (!record) missing("Creative record");
  guard(principal, "production:read", { organizationId: record.project.organizationId, clientId: record.project.clientId, projectId: record.projectId });
  return record;
}

export async function listIntegrations(principal: AuthPrincipal, raw: PageInput = {}) {
  guard(principal, "settings:write");
  const input = page(raw);
  const rows = await db.integrationOutboxEvent.findMany({
    where: { organizationId: principal.organizationId },
    select: { id: true, connectionId: true, eventType: true, aggregateType: true, aggregateId: true, status: true, attempts: true, availableAt: true, processedAt: true, createdAt: true, connection: { select: { provider: true, name: true } } },
    orderBy: { id: "asc" }, take: input.limit,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  return nextCursor(rows.map(({ connection, aggregateType, aggregateId, ...record }) => ({
    ...record, provider: connection?.provider ?? "unassigned", aggregate: `${aggregateType}:${aggregateId}`,
  })), input.limit);
}

export async function getIntegration(principal: AuthPrincipal, id: string) {
  guard(principal, "settings:write");
  const record = await db.integrationOutboxEvent.findFirst({
    where: { id, organizationId: principal.organizationId },
    select: { id: true, connectionId: true, eventType: true, aggregateType: true, aggregateId: true, payload: true, status: true, attempts: true, availableAt: true, processedAt: true, lastError: true, createdAt: true, connection: { select: { provider: true, name: true, status: true, lastSyncedAt: true } } },
  });
  return record ?? missing("Integration event");
}

export async function listSettings(principal: AuthPrincipal, raw: PageInput = {}) {
  guard(principal, "settings:write");
  const input = page(raw);
  const [organization, margins, overhead] = await Promise.all([
    db.organization.findUnique({ where: { id: principal.organizationId }, select: { id: true, name: true, currency: true, timezone: true, minimumMargin: true, targetMargin: true, premiumMargin: true, updatedAt: true } }),
    db.marginSetting.findMany({ where: { organizationId: principal.organizationId }, orderBy: { effectiveFrom: "desc" }, take: 50 }),
    db.overheadRule.findMany({ where: { organizationId: principal.organizationId }, orderBy: { name: "asc" }, take: 50 }),
  ]);
  const records = [
    ...(organization ? [{ id: `organization:${organization.id}`, area: "Organization", setting: organization.name, value: { currency: organization.currency, timezone: organization.timezone }, effectiveFrom: organization.updatedAt, status: "ACTIVE" }] : []),
    ...margins.map((item) => ({ id: `margin:${item.id}`, area: "Pricing", setting: item.servicePath ?? "Default margin", value: { minimum: item.minimumMargin.toString(), target: item.targetMargin.toString(), premium: item.premiumMargin.toString() }, effectiveFrom: item.effectiveFrom, status: "ACTIVE" })),
    ...overhead.map((item) => ({ id: `overhead:${item.id}`, area: "Overhead", setting: item.name, value: { method: item.allocationMethod, rate: item.rate?.toString() ?? null, fixedAmount: item.fixedAmount?.toString() ?? null }, effectiveFrom: null, status: item.active ? "ACTIVE" : "INACTIVE" })),
  ];
  const start = input.cursor ? Math.max(0, records.findIndex((item) => item.id === input.cursor) + 1) : 0;
  return nextCursor(records.slice(start, start + input.limit), input.limit);
}

export async function getSetting(principal: AuthPrincipal, id: string) {
  const result = await listSettings(principal, { limit: 100 });
  return result.items.find((item) => item.id === id) ?? missing("Setting");
}
