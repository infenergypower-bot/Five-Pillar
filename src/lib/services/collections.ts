import type { Prisma } from "@prisma/client";
import type { AuthPrincipal } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  clientCreateSchema,
  intakeCreateSchema,
  invoiceCreateSchema,
  leadCreateSchema,
  originalTitleCreateSchema,
  paginationSchema,
  projectCreateSchema,
  proposalCreateSchema,
  quoteCreateSchema,
} from "./inputs";
import { guard, money, nextCursor } from "./helpers";
import { ServiceError } from "./errors";

type PageInput = { cursor?: string; limit?: number | string };
type Tx = Prisma.TransactionClient;

async function ensureClient(tx: Tx, organizationId: string, clientId?: string): Promise<void> {
  if (!clientId) return;
  const count = await tx.client.count({ where: { id: clientId, organizationId } });
  if (!count) throw new ServiceError("NOT_FOUND", "Client not found", 404);
}

async function audit(
  tx: Tx,
  principal: AuthPrincipal,
  action: string,
  entityType: string,
  entityId: string,
  after: Prisma.InputJsonValue,
): Promise<void> {
  await tx.auditEvent.create({
    data: {
      organizationId: principal.organizationId,
      actorId: principal.userId,
      action,
      entityType,
      entityId,
      after,
    },
  });
}

export async function listLeads(principal: AuthPrincipal, raw: PageInput = {}) {
  guard(principal, "crm:read");
  const page = paginationSchema.parse(raw);
  const rows = await db.lead.findMany({
    where: { organizationId: principal.organizationId },
    select: {
      id: true, businessName: true, contactName: true, email: true, phone: true, source: true,
      stage: true, serviceInterests: true, opportunityValue: true, currency: true,
      nextFollowUpAt: true, ownerId: true, createdAt: true, updatedAt: true,
    },
    orderBy: { id: "asc" },
    take: page.limit,
    ...(page.cursor ? { cursor: { id: page.cursor }, skip: 1 } : {}),
  });
  return nextCursor(rows.map((row) => ({ ...row, opportunityValue: row.opportunityValue ? money(row.opportunityValue) : null })), page.limit);
}

export async function createLead(principal: AuthPrincipal, raw: unknown) {
  guard(principal, "crm:write");
  const input = leadCreateSchema.parse(raw);
  return db.$transaction(async (tx) => {
    if (input.ownerId) {
      const owner = await tx.user.count({ where: { id: input.ownerId, organizationId: principal.organizationId, active: true } });
      if (!owner) throw new ServiceError("NOT_FOUND", "Owner not found", 404);
    }
    const lead = await tx.lead.create({
      data: { ...input, organizationId: principal.organizationId },
      select: {
        id: true, businessName: true, contactName: true, email: true, phone: true, source: true,
        stage: true, serviceInterests: true, opportunityValue: true, currency: true, nextFollowUpAt: true,
        ownerId: true, createdAt: true, updatedAt: true,
      },
    });
    await tx.leadStageHistory.create({ data: { leadId: lead.id, toStage: lead.stage, reason: "Lead created" } });
    await audit(tx, principal, "lead.created", "Lead", lead.id, { stage: lead.stage, businessName: lead.businessName });
    return { ...lead, opportunityValue: lead.opportunityValue ? money(lead.opportunityValue) : null };
  });
}

export async function listClients(principal: AuthPrincipal, raw: PageInput = {}) {
  guard(principal, "crm:read");
  const page = paginationSchema.parse(raw);
  const rows = await db.client.findMany({
    where: { organizationId: principal.organizationId },
    select: {
      id: true, legalName: true, displayName: true, website: true, industry: true, businessType: true,
      timezone: true, createdAt: true, updatedAt: true,
      contacts: { select: { id: true, name: true, email: true, phone: true, title: true, isPrimary: true } },
    },
    orderBy: { id: "asc" },
    take: page.limit,
    ...(page.cursor ? { cursor: { id: page.cursor }, skip: 1 } : {}),
  });
  return nextCursor(rows, page.limit);
}

export async function createClient(principal: AuthPrincipal, raw: unknown) {
  guard(principal, "crm:write");
  const input = clientCreateSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const client = await tx.client.create({
      data: {
        organizationId: principal.organizationId,
        legalName: input.legalName,
        displayName: input.displayName,
        website: input.website,
        industry: input.industry,
        businessType: input.businessType,
        timezone: input.timezone,
        contacts: input.primaryContact ? { create: { ...input.primaryContact, isPrimary: true } } : undefined,
      },
      select: {
        id: true, legalName: true, displayName: true, website: true, industry: true, businessType: true,
        timezone: true, createdAt: true, updatedAt: true,
        contacts: { select: { id: true, name: true, email: true, phone: true, title: true, isPrimary: true } },
      },
    });
    await audit(tx, principal, "client.created", "Client", client.id, { displayName: client.displayName });
    return client;
  });
}

export async function listIntakes(principal: AuthPrincipal, raw: PageInput = {}) {
  guard(principal, "production:read");
  const page = paginationSchema.parse(raw);
  const rows = await db.intake.findMany({
    where: {
      questionnaireVersion: { definition: { organizationId: principal.organizationId } },
      ...(principal.role === "CLIENT" ? { clientId: principal.clientId ?? "__none__" } : {}),
      ...(principal.role === "EXTERNAL_COLLABORATOR" ? { id: "__none__" } : {}),
    },
    select: {
      id: true, clientId: true, questionnaireVersionId: true, version: true, servicePath: true,
      status: true, completeness: true, readiness: true, submittedAt: true, createdAt: true, updatedAt: true,
      client: { select: { displayName: true } },
    },
    orderBy: { id: "asc" },
    take: page.limit,
    ...(page.cursor ? { cursor: { id: page.cursor }, skip: 1 } : {}),
  });
  return nextCursor(rows.map(({ client, ...row }) => ({ ...row, client: client?.displayName ?? null })), page.limit);
}

export async function createIntake(principal: AuthPrincipal, raw: unknown) {
  guard(principal, "production:write");
  const input = intakeCreateSchema.parse(raw);
  return db.$transaction(async (tx) => {
    await ensureClient(tx, principal.organizationId, input.clientId);
    const questionnaire = input.questionnaireVersionId
      ? await tx.questionnaireVersion.findFirst({
          where: { id: input.questionnaireVersionId, definition: { organizationId: principal.organizationId } },
          select: { id: true },
        })
      : await tx.questionnaireVersion.findFirst({
          where: {
            definition: { organizationId: principal.organizationId, status: "ACTIVE" },
            publishedAt: { not: null },
            retiredAt: null,
          },
          orderBy: [{ version: "desc" }, { publishedAt: "desc" }],
          select: { id: true },
        });
    if (!questionnaire) throw new ServiceError("NOT_FOUND", "Questionnaire version not found", 404);
    const last = await tx.intake.findFirst({
      where: { clientId: input.clientId, questionnaireVersionId: questionnaire.id },
      orderBy: { version: "desc" },
      select: { version: true },
    });
    const intake = await tx.intake.create({
      data: {
        clientId: input.clientId,
        questionnaireVersionId: questionnaire.id,
        servicePath: input.servicePath,
        version: (last?.version ?? 0) + 1,
      },
      select: {
        id: true, clientId: true, questionnaireVersionId: true, version: true, servicePath: true,
        status: true, completeness: true, readiness: true, submittedAt: true, createdAt: true, updatedAt: true,
      },
    });
    await tx.serviceSelection.create({
      data: { intakeId: intake.id, servicePath: input.servicePath },
    });
    const servicePathQuestion = await tx.questionDefinition.findFirst({
      where: { section: { versionId: questionnaire.id }, key: "service_path", active: true },
      select: { id: true },
    });
    if (servicePathQuestion) {
      const answer = await tx.intakeAnswer.create({
        data: {
          intakeId: intake.id,
          questionId: servicePathQuestion.id,
          value: [input.servicePath],
          source: "AUTHORIZED_STAFF",
          verificationStatus: "STAFF_VERIFIED",
          verifiedById: principal.userId,
          verifiedAt: new Date(),
          answeredById: principal.userId,
          isDraft: true,
        },
      });
      await tx.intakeAnswerRevision.create({
        data: {
          answerId: answer.id,
          version: 1,
          value: [input.servicePath],
          source: "AUTHORIZED_STAFF",
          verificationStatus: "STAFF_VERIFIED",
          changedById: principal.userId,
          changeReason: "Initialized from intake service selection",
        },
      });
    }
    await audit(tx, principal, "intake.created", "Intake", intake.id, { status: intake.status, servicePath: intake.servicePath });
    return intake;
  });
}

const quoteSelect = {
  id: true,
  clientId: true,
  packageId: true,
  projectTitle: true,
  servicePath: true,
  status: true,
  currency: true,
  currentVersion: true,
  expiresAt: true,
  acceptedAt: true,
  createdAt: true,
  updatedAt: true,
  versions: {
    select: {
      id: true,
      version: true,
      status: true,
      subtotal: true,
      discount: true,
      finalPrice: true,
      approvedAt: true,
      createdAt: true,
      lines: {
        where: { internalOnly: false },
        select: { id: true, category: true, description: true, quantity: true, clientUnitPrice: true, currency: true, sortOrder: true },
      },
    },
    orderBy: { version: "desc" as const },
    take: 1,
  },
} satisfies Prisma.QuoteSelect;

function quoteDto<T extends { versions: Array<{ subtotal: { toString(): string }; discount: { toString(): string }; finalPrice: { toString(): string }; lines: Array<{ quantity: { toString(): string }; clientUnitPrice: { toString(): string } | null }> }> }>(quote: T) {
  return {
    ...quote,
    versions: quote.versions.map((version) => ({
      ...version,
      subtotal: money(version.subtotal),
      discount: money(version.discount),
      finalPrice: money(version.finalPrice),
      lines: version.lines.map((line) => ({
        ...line,
        quantity: money(line.quantity),
        clientUnitPrice: line.clientUnitPrice ? money(line.clientUnitPrice) : null,
      })),
    })),
  };
}

export async function listQuotes(principal: AuthPrincipal, raw: PageInput = {}) {
  guard(principal, "crm:read");
  const page = paginationSchema.parse(raw);
  const rows = await db.quote.findMany({
    where: { organizationId: principal.organizationId },
    select: quoteSelect,
    orderBy: { id: "asc" },
    take: page.limit,
    ...(page.cursor ? { cursor: { id: page.cursor }, skip: 1 } : {}),
  });
  return nextCursor(rows.map(quoteDto), page.limit);
}

export async function createQuote(principal: AuthPrincipal, raw: unknown) {
  guard(principal, "pricing:approve");
  const input = quoteCreateSchema.parse(raw);
  return db.$transaction(async (tx) => {
    await ensureClient(tx, principal.organizationId, input.clientId);
    if (input.packageId) {
      const count = await tx.servicePackage.count({ where: { id: input.packageId, organizationId: principal.organizationId } });
      if (!count) throw new ServiceError("NOT_FOUND", "Service package not found", 404);
    }

    const created = await tx.quote.create({
      data: {
        organizationId: principal.organizationId,
        clientId: input.clientId,
        packageId: input.packageId,
        projectTitle: input.projectTitle,
        servicePath: input.servicePath,
        currency: input.currency,
        expiresAt: input.expiresAt,
      },
      select: { id: true },
    });
    await tx.quoteVersion.create({
      data: {
        quoteId: created.id,
        version: 1,
        laborSubtotal: input.pricing.laborSubtotal,
        nonLaborSubtotal: input.pricing.nonLaborSubtotal,
        overhead: input.pricing.overhead,
        contingency: input.pricing.contingency,
        allInCost: input.pricing.allInCost,
        subtotal: input.pricing.subtotal,
        discount: input.pricing.discount,
        finalPrice: input.pricing.finalPrice,
        targetMargin: input.pricing.targetMargin,
        operatingProfit: input.pricing.operatingProfit,
        operatingMargin: input.pricing.operatingMargin,
        minimumPrice: input.pricing.minimumPrice,
        recommendedPrice: input.pricing.recommendedPrice,
        premiumPrice: input.pricing.premiumPrice,
        lines: { create: input.lines.map((line) => ({ ...line, currency: input.currency })) },
      },
    });
    const quote = await tx.quote.findUniqueOrThrow({ where: { id: created.id }, select: quoteSelect });
    await audit(tx, principal, "quote.created", "Quote", quote.id, { status: quote.status, currentVersion: quote.currentVersion });
    return quoteDto(quote);
  });
}

export async function createProposal(principal: AuthPrincipal, raw: unknown) {
  guard(principal, "pricing:approve");
  const input = proposalCreateSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const quote = await tx.quote.findFirst({
      where: {
        id: input.quoteId,
        organizationId: principal.organizationId,
        status: { in: ["APPROVED", "SENT", "ACCEPTED"] },
      },
      select: {
        id: true, clientId: true, organizationId: true, projectTitle: true, servicePath: true,
        currency: true, expiresAt: true,
        versions: {
          where: { status: { in: ["APPROVED", "SENT", "ACCEPTED"] } },
          orderBy: { version: "desc" },
          take: 1,
          select: {
            version: true, subtotal: true, discount: true, finalPrice: true,
            lines: {
              where: { internalOnly: false },
              orderBy: { sortOrder: "asc" },
              select: { category: true, description: true, quantity: true, clientUnitPrice: true, currency: true },
            },
          },
        },
      },
    });
    const quoteVersion = quote?.versions[0];
    if (!quote || !quoteVersion) {
      throw new ServiceError("QUOTE_NOT_ELIGIBLE", "An approved quote version is required to generate a proposal", 409);
    }
    const existing = await tx.proposal.findFirst({
      where: { quoteId: quote.id, status: "DRAFT" },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (existing) {
      return tx.proposal.findUniqueOrThrow({
        where: { id: existing.id },
        select: {
          id: true, quoteId: true, clientId: true, status: true, currentVersion: true,
          expiresAt: true, createdAt: true,
          quote: { select: { projectTitle: true, servicePath: true, currency: true } },
        },
      });
    }
    const proposal = await tx.proposal.create({
      data: {
        organizationId: quote.organizationId,
        clientId: quote.clientId,
        quoteId: quote.id,
        expiresAt: quote.expiresAt,
        versions: {
          create: {
            version: 1,
            templateKey: input.templateKey,
            sections: {
              project: { title: quote.projectTitle, servicePath: quote.servicePath },
              scope: quoteVersion.lines.map((line) => ({
                category: line.category,
                description: line.description,
                quantity: line.quantity.toString(),
                unitPrice: line.clientUnitPrice?.toString() ?? null,
                currency: line.currency,
              })),
              investment: {
                subtotal: quoteVersion.subtotal.toString(),
                discount: quoteVersion.discount.toString(),
                total: quoteVersion.finalPrice.toString(),
                currency: quote.currency,
              },
              sourceQuoteVersion: quoteVersion.version,
            },
          },
        },
      },
      select: {
        id: true, quoteId: true, clientId: true, status: true, currentVersion: true,
        expiresAt: true, createdAt: true,
        quote: { select: { projectTitle: true, servicePath: true, currency: true } },
      },
    });
    await audit(tx, principal, "proposal.created", "Proposal", proposal.id, {
      quoteId: quote.id,
      quoteVersion: quoteVersion.version,
      status: proposal.status,
    });
    return proposal;
  });
}

export async function listProjects(principal: AuthPrincipal, raw: PageInput = {}) {
  guard(principal, "production:read");
  const page = paginationSchema.parse(raw);
  const rows = await db.project.findMany({
    where: {
      organizationId: principal.organizationId,
      ...(principal.role === "CLIENT" ? { clientId: principal.clientId ?? "__none__" } : {}),
      ...(principal.role === "EXTERNAL_COLLABORATOR" ? { id: { in: [...(principal.assignedProjectIds ?? [])] } } : {}),
    },
    select: {
      id: true, clientId: true, quoteId: true, originalTitleId: true, title: true, servicePath: true,
      status: true, currency: true, budget: true, actualCost: true, startAt: true, dueAt: true, createdAt: true, updatedAt: true,
      scenes: { select: { shots: { select: { approvedTakeId: true } } } },
    },
    orderBy: { id: "asc" },
    take: page.limit,
    ...(page.cursor ? { cursor: { id: page.cursor }, skip: 1 } : {}),
  });
  return nextCursor(rows.map(({ scenes, ...row }) => ({
    ...row,
    budget: row.budget ? money(row.budget) : null,
    actualCost: money(row.actualCost),
    scenes: scenes.length,
    approvedShots: scenes.reduce((count, scene) => count + scene.shots.filter((shot) => Boolean(shot.approvedTakeId)).length, 0),
  })), page.limit);
}

export async function createProject(principal: AuthPrincipal, raw: unknown) {
  guard(principal, "production:write");
  const input = projectCreateSchema.parse(raw);
  return db.$transaction(async (tx) => {
    await ensureClient(tx, principal.organizationId, input.clientId);
    if (input.originalTitleId) {
      const count = await tx.originalTitle.count({ where: { id: input.originalTitleId, organizationId: principal.organizationId } });
      if (!count) throw new ServiceError("NOT_FOUND", "Original title not found", 404);
    }
    const project = await tx.project.create({
      data: { ...input, organizationId: principal.organizationId },
      select: {
        id: true, clientId: true, quoteId: true, originalTitleId: true, title: true, servicePath: true,
        status: true, currency: true, budget: true, startAt: true, dueAt: true, createdAt: true, updatedAt: true,
      },
    });
    await audit(tx, principal, "project.created", "Project", project.id, { status: project.status, title: project.title });
    return { ...project, budget: project.budget ? money(project.budget) : null };
  });
}

export async function listInvoices(principal: AuthPrincipal, raw: PageInput = {}) {
  guard(principal, "finance:read");
  const page = paginationSchema.parse(raw);
  const rows = await db.invoice.findMany({
    where: { organizationId: principal.organizationId },
    select: {
      id: true, clientId: true, projectId: true, number: true, status: true, currency: true,
      subtotal: true, tax: true, total: true, amountPaid: true, dueAt: true, paidAt: true,
      createdAt: true, updatedAt: true,
      client: { select: { displayName: true } },
      lines: { select: { id: true, description: true, quantity: true, unitPrice: true, amount: true } },
    },
    orderBy: { id: "asc" },
    take: page.limit,
    ...(page.cursor ? { cursor: { id: page.cursor }, skip: 1 } : {}),
  });
  return nextCursor(rows.map(({ client, ...row }) => ({
    ...row,
    client: client?.displayName ?? null,
    subtotal: money(row.subtotal), tax: money(row.tax), total: money(row.total), amountPaid: money(row.amountPaid),
    lines: row.lines.map((line) => ({ ...line, quantity: money(line.quantity), unitPrice: money(line.unitPrice), amount: money(line.amount) })),
  })), page.limit);
}

export async function createInvoice(principal: AuthPrincipal, raw: unknown) {
  guard(principal, "finance:write");
  const input = invoiceCreateSchema.parse(raw);
  return db.$transaction(async (tx) => {
    await ensureClient(tx, principal.organizationId, input.clientId);
    if (input.projectId) {
      const project = await tx.project.findFirst({ where: { id: input.projectId, organizationId: principal.organizationId }, select: { clientId: true } });
      if (!project || (input.clientId && project.clientId !== input.clientId)) throw new ServiceError("NOT_FOUND", "Project not found", 404);
    }
    const lineData = input.lines.map((line) => ({ ...line, amount: line.quantity * line.unitPrice }));
    const subtotal = lineData.reduce((sum, line) => sum + line.amount, 0);
    const invoice = await tx.invoice.create({
      data: {
        organizationId: principal.organizationId, clientId: input.clientId, projectId: input.projectId,
        number: input.number, currency: input.currency, tax: input.tax, subtotal,
        total: subtotal + input.tax, dueAt: input.dueAt, lines: { create: lineData },
      },
      select: {
        id: true, clientId: true, projectId: true, number: true, status: true, currency: true,
        subtotal: true, tax: true, total: true, amountPaid: true, dueAt: true, paidAt: true,
        createdAt: true, updatedAt: true,
      },
    });
    await audit(tx, principal, "invoice.created", "Invoice", invoice.id, { status: invoice.status, number: invoice.number });
    return { ...invoice, subtotal: money(invoice.subtotal), tax: money(invoice.tax), total: money(invoice.total), amountPaid: money(invoice.amountPaid) };
  });
}

export async function listOriginalTitles(principal: AuthPrincipal, raw: PageInput = {}) {
  guard(principal, "production:read");
  if (principal.role === "EXTERNAL_COLLABORATOR") throw new ServiceError("FORBIDDEN", "You do not have access to original IP records", 403);
  const page = paginationSchema.parse(raw);
  const rows = await db.originalTitle.findMany({
    where: { organizationId: principal.organizationId },
    select: {
      id: true, workingTitle: true, format: true, genre: true, logline: true, synopsis: true,
      runtimeMinutes: true, episodeCount: true, rightsStatus: true, developmentBudget: true,
      productionBudget: true, releaseBudget: true, currency: true, createdAt: true, updatedAt: true,
    },
    orderBy: { id: "asc" },
    take: page.limit,
    ...(page.cursor ? { cursor: { id: page.cursor }, skip: 1 } : {}),
  });
  return nextCursor(rows.map((row) => ({
    ...row,
    developmentBudget: money(row.developmentBudget),
    productionBudget: money(row.productionBudget),
    releaseBudget: money(row.releaseBudget),
  })), page.limit);
}

export async function createOriginalTitle(principal: AuthPrincipal, raw: unknown) {
  guard(principal, "production:write");
  const input = originalTitleCreateSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const title = await tx.originalTitle.create({
      data: { ...input, organizationId: principal.organizationId },
      select: {
        id: true, workingTitle: true, format: true, genre: true, logline: true, synopsis: true,
        runtimeMinutes: true, episodeCount: true, rightsStatus: true, developmentBudget: true,
        productionBudget: true, releaseBudget: true, currency: true, createdAt: true, updatedAt: true,
      },
    });
    await audit(tx, principal, "original_title.created", "OriginalTitle", title.id, { workingTitle: title.workingTitle, format: title.format });
    return {
      ...title,
      developmentBudget: money(title.developmentBudget),
      productionBudget: money(title.productionBudget),
      releaseBudget: money(title.releaseBudget),
    };
  });
}
