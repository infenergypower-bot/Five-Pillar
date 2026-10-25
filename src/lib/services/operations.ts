import {
  ApprovalStatus,
  AssetStatus,
  IntakeStatus,
  InvoiceStatus,
  PaymentStatus,
  ProjectStatus,
  ProposalStatus,
  QuoteStatus,
  type Prisma,
} from "@prisma/client";
import type { AuthPrincipal } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertProjectTransition } from "@/lib/workflow";
import { ServiceError } from "./errors";
import { assertOrganization, guard, money } from "./helpers";
import { assertProposalStatusTransition, assertQuoteStatusTransition, assertRevisionInvariant, deriveInvoiceStatus } from "./invariants";
import {
  approvalCreateSchema,
  approvalDecisionSchema,
  assetSchema,
  changeOrderCreateSchema,
  changeOrderStatusSchema,
  intakeStatusSchema,
  leadStageSchema,
  outboxSchema,
  paymentSchema,
  projectTransitionSchema,
  proposalAcceptanceSchema,
  proposalStatusSchema,
  quoteStatusSchema,
  revisionCreateSchema,
} from "./inputs";

type Tx = Prisma.TransactionClient;

async function audit(
  tx: Tx,
  principal: AuthPrincipal,
  input: {
    action: string;
    entityType: string;
    entityId: string;
    before?: Prisma.InputJsonValue;
    after?: Prisma.InputJsonValue;
    reason?: string;
    correlationId?: string;
  },
) {
  await tx.auditEvent.create({
    data: {
      organizationId: principal.organizationId,
      actorId: principal.userId,
      ...input,
    },
  });
}

export async function transitionLead(principal: AuthPrincipal, leadId: string, raw: unknown) {
  guard(principal, "crm:write");
  const input = leadStageSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const lead = await tx.lead.findUnique({ where: { id: leadId }, select: { id: true, organizationId: true, stage: true } });
    if (!lead) throw new ServiceError("NOT_FOUND", "Lead not found", 404);
    assertOrganization(principal, lead.organizationId);
    if (lead.stage === input.stage) return lead;
    const updated = await tx.lead.update({ where: { id: leadId }, data: { stage: input.stage }, select: { id: true, stage: true, updatedAt: true } });
    await tx.leadStageHistory.create({ data: { leadId, fromStage: lead.stage, toStage: input.stage, reason: input.reason } });
    await audit(tx, principal, { action: "lead.stage_changed", entityType: "Lead", entityId: leadId, before: { stage: lead.stage }, after: { stage: input.stage }, reason: input.reason });
    return updated;
  });
}

export async function updateIntakeStatus(principal: AuthPrincipal, intakeId: string, raw: unknown) {
  guard(principal, "production:write");
  const input = intakeStatusSchema.parse(raw);
  const allowed: Partial<Record<IntakeStatus, readonly IntakeStatus[]>> = {
    DRAFT: [IntakeStatus.IN_PROGRESS, IntakeStatus.SUBMITTED, IntakeStatus.ARCHIVED],
    IN_PROGRESS: [IntakeStatus.SUBMITTED, IntakeStatus.ARCHIVED],
    SUBMITTED: [IntakeStatus.REVIEWED, IntakeStatus.IN_PROGRESS],
    REVIEWED: [IntakeStatus.COMPLETE, IntakeStatus.IN_PROGRESS],
    COMPLETE: [IntakeStatus.ARCHIVED],
  };
  return db.$transaction(async (tx) => {
    const intake = await tx.intake.findUnique({
      where: { id: intakeId },
      include: { client: { select: { organizationId: true } } },
    });
    if (!intake?.client) throw new ServiceError("NOT_FOUND", "Intake not found", 404);
    guard(principal, "production:write", { organizationId: intake.client.organizationId, clientId: intake.clientId });
    if (intake.status !== input.status && !allowed[intake.status]?.includes(input.status)) {
      throw new ServiceError("INVALID_TRANSITION", `Invalid intake transition: ${intake.status} -> ${input.status}`, 409);
    }
    const updated = await tx.intake.update({
      where: { id: intakeId },
      data: { status: input.status, submittedAt: input.status === IntakeStatus.SUBMITTED ? new Date() : intake.submittedAt },
      select: { id: true, status: true, completeness: true, submittedAt: true, updatedAt: true },
    });
    await audit(tx, principal, { action: "intake.status_changed", entityType: "Intake", entityId: intakeId, before: { status: intake.status }, after: { status: input.status } });
    return updated;
  });
}

export async function transitionQuote(principal: AuthPrincipal, quoteId: string, raw: unknown) {
  guard(principal, "pricing:approve");
  const input = quoteStatusSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const quote = await tx.quote.findUnique({ where: { id: quoteId }, select: { id: true, organizationId: true, status: true, currentVersion: true } });
    if (!quote) throw new ServiceError("NOT_FOUND", "Quote not found", 404);
    assertOrganization(principal, quote.organizationId);
    if (quote.status !== input.status) assertQuoteStatusTransition(quote.status, input.status);
    const updated = await tx.quote.update({
      where: { id: quoteId },
      data: { status: input.status, acceptedAt: input.status === QuoteStatus.ACCEPTED ? new Date() : undefined },
      select: { id: true, status: true, acceptedAt: true, updatedAt: true },
    });
    await tx.quoteVersion.updateMany({
      where: { quoteId, version: quote.currentVersion },
      data: {
        status: input.status,
        approvedAt: input.status === QuoteStatus.APPROVED ? new Date() : undefined,
      },
    });
    await audit(tx, principal, { action: "quote.status_changed", entityType: "Quote", entityId: quoteId, before: { status: quote.status }, after: { status: input.status }, reason: input.reason });
    return updated;
  });
}

export async function acceptProposal(
  principal: AuthPrincipal,
  proposalId: string,
  raw: unknown,
  ipAddress?: string,
) {
  guard(principal, "portal:read");
  const input = proposalAcceptanceSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const proposal = await tx.proposal.findUnique({
      where: { id: proposalId },
      include: { quote: { select: { id: true, status: true } } },
    });
    if (!proposal) throw new ServiceError("NOT_FOUND", "Proposal not found", 404);
    guard(principal, "portal:read", { organizationId: proposal.organizationId, clientId: proposal.clientId });
    if (proposal.expiresAt && proposal.expiresAt <= new Date()) throw new ServiceError("PROPOSAL_EXPIRED", "Proposal has expired", 409);
    if (!new Set<ProposalStatus>([ProposalStatus.SENT, ProposalStatus.VIEWED, ProposalStatus.ACCEPTED]).has(proposal.status)) {
      throw new ServiceError("INVALID_TRANSITION", "Proposal is not available for acceptance", 409);
    }
    const existing = await tx.proposalAcceptance.findFirst({
      where: { proposalId, email: input.email, accepted: true },
      select: { id: true, acceptedAt: true },
    });
    if (existing) return existing;
    const acceptance = await tx.proposalAcceptance.create({
      data: { proposalId, ...input, ipAddress },
      select: { id: true, acceptedAt: true },
    });
    await tx.proposal.update({ where: { id: proposalId }, data: { status: ProposalStatus.ACCEPTED } });
    await tx.quote.update({ where: { id: proposal.quote.id }, data: { status: QuoteStatus.ACCEPTED, acceptedAt: acceptance.acceptedAt } });
    await audit(tx, principal, { action: "proposal.accepted", entityType: "Proposal", entityId: proposalId, after: { accepted: true } });
    return acceptance;
  });
}

export async function transitionProposal(principal: AuthPrincipal, proposalId: string, raw: unknown) {
  guard(principal, "pricing:approve");
  const input = proposalStatusSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const proposal = await tx.proposal.findUnique({
      where: { id: proposalId },
      select: { id: true, organizationId: true, status: true },
    });
    if (!proposal) throw new ServiceError("NOT_FOUND", "Proposal not found", 404);
    assertOrganization(principal, proposal.organizationId);
    if (proposal.status !== input.status) assertProposalStatusTransition(proposal.status, input.status);
    const updated = await tx.proposal.update({
      where: { id: proposalId },
      data: { status: input.status },
      select: { id: true, status: true },
    });
    await audit(tx, principal, {
      action: "proposal.status_changed",
      entityType: "Proposal",
      entityId: proposalId,
      before: { status: proposal.status },
      after: { status: input.status },
    });
    return updated;
  });
}

export async function convertQuoteToProject(principal: AuthPrincipal, quoteId: string) {
  guard(principal, "production:write");
  return db.$transaction(async (tx) => {
    const quote = await tx.quote.findUnique({
      where: { id: quoteId },
      include: { versions: { where: { version: { equals: 1 } }, take: 1 } },
    });
    if (!quote) throw new ServiceError("NOT_FOUND", "Quote not found", 404);
    assertOrganization(principal, quote.organizationId);
    const existing = await tx.project.findUnique({ where: { quoteId }, select: { id: true, status: true, title: true } });
    if (existing) return existing;
    if (quote.status !== QuoteStatus.ACCEPTED) throw new ServiceError("QUOTE_NOT_ACCEPTED", "Only accepted quotes can become projects", 409);
    const currentVersion = await tx.quoteVersion.findUnique({
      where: { quoteId_version: { quoteId, version: quote.currentVersion } },
      select: { finalPrice: true },
    });
    if (!currentVersion) throw new ServiceError("QUOTE_VERSION_MISSING", "Accepted quote version was not found", 409);
    const project = await tx.project.create({
      data: {
        organizationId: quote.organizationId,
        clientId: quote.clientId,
        quoteId,
        title: quote.projectTitle,
        servicePath: quote.servicePath,
        currency: quote.currency,
        budget: currentVersion.finalPrice,
        milestones: {
          create: [
            { name: "Discovery complete", sortOrder: 1 },
            { name: "Creative approved", sortOrder: 2 },
            { name: "Production complete", sortOrder: 3 },
            { name: "Final delivery", sortOrder: 4 },
          ],
        },
        tasks: {
          create: [
            { title: "Confirm intake and source assets", priority: 1 },
            { title: "Prepare production brief", priority: 2 },
            { title: "Build production schedule", priority: 3 },
          ],
        },
        approvals: {
          create: ["CONCEPT", "SCRIPT", "STORYBOARD", "ROUGH_CUT", "FINAL_CUT", "FINAL_DELIVERY"].map((type) => ({ type: type as never })),
        },
      },
      select: { id: true, title: true, status: true, quoteId: true, clientId: true, dueAt: true },
    });
    await audit(tx, principal, { action: "quote.converted_to_project", entityType: "Project", entityId: project.id, after: { quoteId, status: project.status } });
    return project;
  });
}

export async function transitionProject(principal: AuthPrincipal, projectId: string, raw: unknown) {
  guard(principal, "production:write");
  const input = projectTransitionSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const project = await tx.project.findUnique({
      where: { id: projectId },
      select: { id: true, organizationId: true, clientId: true, status: true },
    });
    if (!project) throw new ServiceError("NOT_FOUND", "Project not found", 404);
    guard(principal, "production:write", { organizationId: project.organizationId, clientId: project.clientId, projectId });
    if (project.status !== input.status) {
      try {
        assertProjectTransition(project.status, input.status);
      } catch {
        throw new ServiceError("INVALID_TRANSITION", `Invalid project transition: ${project.status} -> ${input.status}`, 409);
      }
    }
    if (input.status === ProjectStatus.DELIVERY) {
      const pending = await tx.approval.count({ where: { projectId, type: "FINAL_DELIVERY", status: { not: ApprovalStatus.APPROVED } } });
      const unpaid = await tx.invoice.count({ where: { projectId, status: { notIn: [InvoiceStatus.PAID, InvoiceStatus.VOID] } } });
      if (pending || unpaid) throw new ServiceError("DELIVERY_BLOCKED", "Final approval and payment are required before delivery", 409);
    }
    const updated = await tx.project.update({ where: { id: projectId }, data: { status: input.status }, select: { id: true, status: true, updatedAt: true } });
    await audit(tx, principal, { action: "project.status_changed", entityType: "Project", entityId: projectId, before: { status: project.status }, after: { status: input.status }, reason: input.reason });
    return updated;
  });
}

export async function requestApproval(principal: AuthPrincipal, projectId: string, raw: unknown) {
  guard(principal, "production:write");
  const input = approvalCreateSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const project = await tx.project.findUnique({ where: { id: projectId }, select: { organizationId: true, clientId: true } });
    if (!project) throw new ServiceError("NOT_FOUND", "Project not found", 404);
    guard(principal, "production:write", { ...project, projectId });
    if (input.reviewId) {
      const count = await tx.review.count({ where: { id: input.reviewId, projectId } });
      if (!count) throw new ServiceError("NOT_FOUND", "Review not found", 404);
    }
    const approval = await tx.approval.create({ data: { projectId, ...input }, select: { id: true, type: true, status: true, requestedAt: true } });
    await audit(tx, principal, { action: "approval.requested", entityType: "Approval", entityId: approval.id, after: { type: approval.type, status: approval.status } });
    return approval;
  });
}

export async function decideApproval(principal: AuthPrincipal, approvalId: string, raw: unknown) {
  guard(principal, "portal:read");
  const input = approvalDecisionSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const approval = await tx.approval.findUnique({
      where: { id: approvalId },
      include: { project: { select: { organizationId: true, clientId: true } } },
    });
    if (!approval) throw new ServiceError("NOT_FOUND", "Approval not found", 404);
    guard(principal, "portal:read", { ...approval.project, projectId: approval.projectId });
    if (approval.status !== ApprovalStatus.PENDING) throw new ServiceError("ALREADY_DECIDED", "Approval has already been decided", 409);
    const updated = await tx.approval.update({
      where: { id: approvalId },
      data: { status: input.status, reason: input.reason, decidedById: principal.userId, decidedAt: new Date() },
      select: { id: true, type: true, status: true, reason: true, decidedAt: true },
    });
    await audit(tx, principal, { action: "approval.decided", entityType: "Approval", entityId: approvalId, before: { status: approval.status }, after: { status: input.status }, reason: input.reason });
    return updated;
  });
}

export async function createRevision(principal: AuthPrincipal, projectId: string, raw: unknown) {
  guard(principal, "production:write");
  const input = revisionCreateSchema.parse(raw);
  assertRevisionInvariant(input);
  return db.$transaction(async (tx) => {
    const project = await tx.project.findUnique({ where: { id: projectId }, select: { organizationId: true, clientId: true } });
    if (!project) throw new ServiceError("NOT_FOUND", "Project not found", 404);
    guard(principal, "production:write", { ...project, projectId });
    if (input.reviewId && !(await tx.review.count({ where: { id: input.reviewId, projectId } }))) {
      throw new ServiceError("NOT_FOUND", "Review not found", 404);
    }
    const revision = await tx.revisionRequest.create({
      data: { projectId, ...input },
      select: { id: true, category: true, title: true, description: true, includedInScope: true, estimatedCost: true, estimatedHours: true, status: true, createdAt: true },
    });
    await audit(tx, principal, { action: "revision.created", entityType: "RevisionRequest", entityId: revision.id, after: { category: revision.category, includedInScope: revision.includedInScope } });
    return {
      ...revision,
      estimatedCost: revision.estimatedCost ? money(revision.estimatedCost) : null,
      estimatedHours: revision.estimatedHours ? money(revision.estimatedHours) : null,
    };
  });
}

export async function createChangeOrder(principal: AuthPrincipal, projectId: string, raw: unknown) {
  guard(principal, "pricing:approve");
  const input = changeOrderCreateSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const project = await tx.project.findUnique({ where: { id: projectId }, select: { organizationId: true, clientId: true } });
    if (!project) throw new ServiceError("NOT_FOUND", "Project not found", 404);
    assertOrganization(principal, project.organizationId);
    if (input.contractId && !(await tx.contract.count({ where: { id: input.contractId, projectId } }))) {
      throw new ServiceError("NOT_FOUND", "Contract not found", 404);
    }
    const totalCost = input.lines.reduce((sum, line) => sum + line.quantity * line.unitCost, 0);
    const totalPrice = input.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
    if (totalPrice < totalCost) throw new ServiceError("BELOW_COST", "Change-order price cannot be below cost", 409);
    const changeOrder = await tx.changeOrder.create({
      data: {
        projectId, contractId: input.contractId, number: input.number, reason: input.reason,
        currency: input.currency, timelineImpactDays: input.timelineImpactDays, totalCost, totalPrice,
        lines: { create: input.lines },
      },
      select: { id: true, number: true, status: true, reason: true, currency: true, totalPrice: true, timelineImpactDays: true },
    });
    await audit(tx, principal, { action: "change_order.created", entityType: "ChangeOrder", entityId: changeOrder.id, after: { number: changeOrder.number, status: changeOrder.status } });
    return { ...changeOrder, totalPrice: money(changeOrder.totalPrice) };
  });
}

export async function updateChangeOrderStatus(principal: AuthPrincipal, changeOrderId: string, raw: unknown) {
  guard(principal, "portal:read");
  const input = changeOrderStatusSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const order = await tx.changeOrder.findUnique({
      where: { id: changeOrderId },
      include: { project: { select: { organizationId: true, clientId: true } } },
    });
    if (!order) throw new ServiceError("NOT_FOUND", "Change order not found", 404);
    guard(principal, "portal:read", { ...order.project, projectId: order.projectId });
    const allowed: Partial<Record<ProposalStatus, readonly ProposalStatus[]>> = {
      DRAFT: [ProposalStatus.INTERNAL_REVIEW],
      INTERNAL_REVIEW: [ProposalStatus.DRAFT, ProposalStatus.SENT],
      SENT: [ProposalStatus.ACCEPTED, ProposalStatus.DECLINED, ProposalStatus.EXPIRED],
    };
    if (order.status !== input.status && !allowed[order.status]?.includes(input.status)) {
      throw new ServiceError("INVALID_TRANSITION", `Invalid change-order transition: ${order.status} -> ${input.status}`, 409);
    }
    const updated = await tx.changeOrder.update({
      where: { id: changeOrderId },
      data: { status: input.status, acceptedAt: input.status === ProposalStatus.ACCEPTED ? new Date() : undefined },
      select: { id: true, status: true, acceptedAt: true },
    });
    await audit(tx, principal, { action: "change_order.status_changed", entityType: "ChangeOrder", entityId: changeOrderId, before: { status: order.status }, after: { status: input.status } });
    return updated;
  });
}

export async function reconcilePayment(principal: AuthPrincipal, invoiceId: string, raw: unknown) {
  guard(principal, "finance:write");
  const input = paymentSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new ServiceError("NOT_FOUND", "Invoice not found", 404);
    assertOrganization(principal, invoice.organizationId);
    const existing = await tx.payment.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) {
      if (existing.invoiceId !== invoiceId || existing.amount.toString() !== input.amount.toString() || existing.currency !== input.currency) {
        throw new ServiceError("IDEMPOTENCY_CONFLICT", "Idempotency key was used for a different payment", 409);
      }
      return { id: existing.id, status: existing.status, invoiceId: existing.invoiceId, amount: money(existing.amount), currency: existing.currency };
    }
    if (input.currency !== invoice.currency) throw new ServiceError("CURRENCY_MISMATCH", "Payment currency must match invoice currency", 409);
    const payment = await tx.payment.create({
      data: { organizationId: principal.organizationId, invoiceId, ...input },
      select: { id: true, status: true, invoiceId: true, amount: true, currency: true, receivedAt: true },
    });
    const aggregate = await tx.payment.aggregate({
      where: { invoiceId, status: PaymentStatus.SUCCEEDED },
      _sum: { amount: true },
    });
    const amountPaid = aggregate._sum.amount?.toNumber() ?? 0;
    const status = deriveInvoiceStatus(invoice.total.toNumber(), amountPaid, invoice.dueAt);
    await tx.invoice.update({
      where: { id: invoiceId },
      data: { amountPaid, status, paidAt: status === InvoiceStatus.PAID ? input.receivedAt ?? new Date() : null },
    });
    await audit(tx, principal, {
      action: "payment.reconciled",
      entityType: "Payment",
      entityId: payment.id,
      after: { invoiceId, status: payment.status, amount: payment.amount.toString(), invoiceStatus: status },
      correlationId: input.idempotencyKey,
    });
    return { ...payment, amount: money(payment.amount), invoiceStatus: status, amountPaid: amountPaid.toString() };
  });
}

export async function registerAssetMetadata(principal: AuthPrincipal, raw: unknown) {
  guard(principal, "production:write");
  const input = assetSchema.parse(raw);
  return db.$transaction(async (tx) => {
    if (input.projectId) {
      const project = await tx.project.findUnique({ where: { id: input.projectId }, select: { organizationId: true, clientId: true } });
      if (!project) throw new ServiceError("NOT_FOUND", "Project not found", 404);
      guard(principal, "production:write", { ...project, projectId: input.projectId });
      if (input.clientId && project.clientId !== input.clientId) throw new ServiceError("INVALID_CLIENT", "Asset client does not match project client", 409);
    } else if (input.clientId) {
      const client = await tx.client.findUnique({ where: { id: input.clientId }, select: { organizationId: true } });
      if (!client) throw new ServiceError("NOT_FOUND", "Client not found", 404);
      assertOrganization(principal, client.organizationId);
    }
    const asset = await tx.asset.create({
      data: {
        projectId: input.projectId,
        clientId: input.clientId,
        category: input.category,
        name: input.name,
        storageKey: input.storageKey,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        checksum: input.checksum,
        metadata: input.metadata as Prisma.InputJsonObject | undefined,
        ownerOrganizationId: principal.organizationId,
        status: AssetStatus.PENDING_SCAN,
      },
      select: { id: true, projectId: true, clientId: true, category: true, name: true, storageKey: true, mimeType: true, sizeBytes: true, checksum: true, version: true, status: true, approvalStatus: true, metadata: true, createdAt: true },
    });
    await audit(tx, principal, { action: "asset.metadata_registered", entityType: "Asset", entityId: asset.id, after: { storageKey: asset.storageKey, status: asset.status } });
    return { ...asset, sizeBytes: asset.sizeBytes.toString() };
  });
}

export async function enqueueOutbox(principal: AuthPrincipal, raw: unknown) {
  guard(principal, "settings:write");
  const input = outboxSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const existing = await tx.integrationOutboxEvent.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) {
      if (existing.organizationId !== principal.organizationId || existing.eventType !== input.eventType || existing.aggregateId !== input.aggregateId) {
        throw new ServiceError("IDEMPOTENCY_CONFLICT", "Idempotency key was used for a different event", 409);
      }
      return { id: existing.id, status: existing.status, createdAt: existing.createdAt };
    }
    if (input.connectionId && !(await tx.integrationConnection.count({ where: { id: input.connectionId, organizationId: principal.organizationId } }))) {
      throw new ServiceError("NOT_FOUND", "Integration connection not found", 404);
    }
    const event = await tx.integrationOutboxEvent.create({
      data: { ...input, organizationId: principal.organizationId, payload: input.payload as Prisma.InputJsonObject },
      select: { id: true, status: true, createdAt: true },
    });
    await audit(tx, principal, { action: "outbox.enqueued", entityType: "IntegrationOutboxEvent", entityId: event.id, after: { eventType: input.eventType, aggregateType: input.aggregateType }, correlationId: input.idempotencyKey });
    return event;
  });
}

export async function getDashboardSummary(principal: AuthPrincipal) {
  guard(principal, "crm:read");
  const organizationId = principal.organizationId;
  const [leadCounts, projectCounts, quoteCounts, invoiceCounts, recentProjects] = await Promise.all([
    db.lead.groupBy({ by: ["stage"], where: { organizationId }, orderBy: { stage: "asc" }, _count: { _all: true } }),
    db.project.groupBy({ by: ["status"], where: { organizationId }, orderBy: { status: "asc" }, _count: { _all: true } }),
    db.quote.groupBy({ by: ["status"], where: { organizationId }, orderBy: { status: "asc" }, _count: { _all: true } }),
    db.invoice.groupBy({ by: ["status"], where: { organizationId }, orderBy: { status: "asc" }, _count: { _all: true }, _sum: { total: true, amountPaid: true } }),
    db.project.findMany({
      where: { organizationId },
      select: { id: true, title: true, status: true, dueAt: true, client: { select: { id: true, displayName: true } } },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
  ]);
  return {
    leads: Object.fromEntries(leadCounts.map((item) => [item.stage, item._count._all])),
    projects: Object.fromEntries(projectCounts.map((item) => [item.status, item._count._all])),
    quotes: Object.fromEntries(quoteCounts.map((item) => [item.status, item._count._all])),
    invoices: invoiceCounts.map((item) => ({
      status: item.status,
      count: item._count._all,
      billed: item._sum.total?.toString() ?? "0",
      collected: item._sum.amountPaid?.toString() ?? "0",
    })),
    recentProjects,
  };
}

export async function getPortalSummary(principal: AuthPrincipal) {
  guard(principal, "portal:read");
  if (!principal.clientId) throw new ServiceError("CLIENT_CONTEXT_REQUIRED", "This account is not linked to a client", 403);
  const clientId = principal.clientId;
  const client = await db.client.findFirst({
    where: { id: clientId, organizationId: principal.organizationId },
    select: {
      id: true,
      displayName: true,
      projects: {
        select: {
          id: true, title: true, status: true, dueAt: true,
          approvals: {
            where: { status: ApprovalStatus.PENDING },
            select: { id: true, type: true, requestedAt: true },
          },
          deliverables: { select: { id: true, name: true, format: true, status: true, releasedAt: true, acceptedAt: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
      proposals: {
        where: { status: { in: [ProposalStatus.SENT, ProposalStatus.VIEWED] } },
        select: { id: true, status: true, expiresAt: true, createdAt: true },
      },
      invoices: {
        where: { status: { notIn: [InvoiceStatus.DRAFT, InvoiceStatus.VOID] } },
        select: { id: true, number: true, status: true, currency: true, total: true, amountPaid: true, dueAt: true, paidAt: true },
        orderBy: { dueAt: "desc" },
      },
    },
  });
  if (!client) throw new ServiceError("NOT_FOUND", "Client not found", 404);
  return {
    ...client,
    invoices: client.invoices.map((invoice) => ({
      ...invoice,
      total: money(invoice.total),
      amountPaid: money(invoice.amountPaid),
    })),
  };
}
