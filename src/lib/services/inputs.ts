import {
  AnswerSource,
  ApprovalStatus,
  ApprovalType,
  IPFormat,
  IntakeStatus,
  LeadStage,
  PaymentStatus,
  ProjectStatus,
  ProposalStatus,
  QuestionType,
  QuoteStatus,
  RevisionCategory,
  RightsStatus,
  ServicePath,
  VerificationStatus,
  WorkStatus,
} from "@prisma/client";
import { z } from "zod";

const id = z.string().trim().min(1).max(128);
const money = z.coerce.number().finite().nonnegative().max(1_000_000_000);
const currency = z.string().trim().regex(/^[A-Z]{3}$/).default("USD");
const optionalDate = z.coerce.date().optional();

export const paginationSchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});
export const leadCreateSchema = z.object({
  businessName: z.string().trim().min(1).max(200),
  contactName: z.string().trim().min(1).max(200),
  email: z.email().trim().toLowerCase(),
  phone: z.string().trim().max(40).optional(),
  source: z.string().trim().max(120).optional(),
  serviceInterests: z.array(z.enum(ServicePath)).max(10).default([]),
  opportunityValue: money.optional(),
  currency,
  nextFollowUpAt: optionalDate,
  ownerId: id.optional(),
});
export const clientCreateSchema = z.object({
  legalName: z.string().trim().min(1).max(240),
  displayName: z.string().trim().min(1).max(160),
  website: z.url().optional(),
  industry: z.string().trim().max(120).optional(),
  businessType: z.string().trim().max(120).optional(),
  timezone: z.string().trim().max(80).optional(),
  primaryContact: z.object({
    name: z.string().trim().min(1).max(160),
    email: z.email().trim().toLowerCase(),
    phone: z.string().trim().max(40).optional(),
    title: z.string().trim().max(120).optional(),
  }).optional(),
});
export const intakeCreateSchema = z.object({
  clientId: id.optional(),
  projectId: id.optional(),
  questionnaireVersionId: id.optional(),
  serviceTypeId: id.optional(),
  servicePath: z.enum(ServicePath),
});
export const discoveryAnswerSchema = z.object({
  answers: z.array(z.object({
    questionId: id,
    value: z.unknown(),
    source: z.enum(AnswerSource).default(AnswerSource.CLIENT),
    sourceReference: z.string().trim().max(500).optional(),
    verificationStatus: z.enum(VerificationStatus).default(VerificationStatus.UNVERIFIED),
  })).min(1).max(200),
  changeReason: z.string().trim().max(1000).optional(),
});
export const discoveryVerificationSchema = z.object({
  verificationStatus: z.enum([VerificationStatus.CLIENT_CONFIRMED, VerificationStatus.STAFF_VERIFIED, VerificationStatus.REJECTED]),
  reason: z.string().trim().max(1000).optional(),
});
export const discoveryMaterialSchema = z.object({
  assetId: id,
  category: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional(),
  extractedData: z.record(z.string(), z.unknown()).optional(),
  extractionProvider: z.string().trim().max(120).optional(),
});
export const discoveryConfirmationSchema = z.object({
  confirmerName: z.string().trim().min(1).max(160),
  confirmerEmail: z.email().trim().toLowerCase(),
  confirmation: z.object({
    accepted: z.literal(true),
    notes: z.string().trim().max(2000).optional(),
  }),
});
export const discoveryCollaboratorSchema = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.email().trim().toLowerCase(),
  role: z.string().trim().min(1).max(120),
  permissions: z.array(z.string().trim().min(1).max(80)).max(20).default(["ANSWER"]),
});
export const discoveryQuestionSchema = z.object({
  sectionId: id,
  key: z.string().trim().regex(/^[a-z0-9_]+$/).max(120),
  label: z.string().trim().min(1).max(500),
  description: z.string().trim().max(2000).optional(),
  helpText: z.string().trim().max(2000).optional(),
  type: z.enum(QuestionType),
  category: z.string().trim().min(1).max(120),
  required: z.boolean().default(false),
  recommended: z.boolean().default(false),
  internalOnly: z.boolean().default(false),
  allowsFile: z.boolean().default(false),
  critical: z.boolean().default(false),
  active: z.boolean().default(true),
  validation: z.record(z.string(), z.unknown()).optional(),
  destination: z.record(z.string(), z.unknown()).optional(),
  reuseKey: z.string().trim().max(120).optional(),
  clarification: z.record(z.string(), z.unknown()).optional(),
  sortOrder: z.number().int().min(0).max(10_000),
  conditions: z.array(z.object({
    sourceQuestionId: id,
    operator: z.string().trim().min(1).max(40),
    expectedValue: z.unknown(),
  })).max(20).default([]),
});
export const discoveryQuestionUpdateSchema = discoveryQuestionSchema.partial().omit({ sectionId: true, key: true });
export const serviceTypeDefinitionSchema = z.object({
  key: z.string().trim().regex(/^[a-z0-9_-]+$/).max(120),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  active: z.boolean().default(true),
  configuration: z.record(z.string(), z.unknown()).optional(),
});
export const proposalCreateSchema = z.object({
  quoteId: id,
  templateKey: z.string().trim().min(1).max(120).default("standard-proposal"),
});
export const quoteCreateSchema = z.object({
  clientId: id.optional(),
  packageId: id.optional(),
  projectTitle: z.string().trim().min(1).max(240),
  servicePath: z.enum(ServicePath),
  currency,
  expiresAt: optionalDate,
  pricing: z.object({
    laborSubtotal: money,
    nonLaborSubtotal: money,
    overhead: money.default(0),
    contingency: money.default(0),
    allInCost: money,
    subtotal: money,
    discount: money.default(0),
    finalPrice: money,
    targetMargin: z.coerce.number().min(0).max(1),
    operatingProfit: z.coerce.number().finite(),
    operatingMargin: z.coerce.number().min(-10).max(1),
    minimumPrice: money,
    recommendedPrice: money,
    premiumPrice: money,
  }),
  lines: z.array(z.object({
    category: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(500),
    quantity: z.coerce.number().positive(),
    unitCost: money,
    clientUnitPrice: money.optional(),
    internalOnly: z.boolean().default(true),
    servicePath: z.enum(ServicePath).optional(),
    sortOrder: z.number().int().min(0).default(0),
  })).max(200).default([]),
});
export const projectCreateSchema = z.object({
  clientId: id.optional(),
  originalTitleId: id.optional(),
  title: z.string().trim().min(1).max(240),
  servicePath: z.enum(ServicePath),
  currency,
  budget: money.optional(),
  startAt: optionalDate,
  dueAt: optionalDate,
});
export const invoiceCreateSchema = z.object({
  clientId: id.optional(),
  projectId: id.optional(),
  number: z.string().trim().min(1).max(80),
  currency,
  tax: money.default(0),
  dueAt: z.coerce.date(),
  lines: z.array(z.object({
    description: z.string().trim().min(1).max(500),
    quantity: z.coerce.number().positive(),
    unitPrice: money,
  })).min(1).max(200),
});
export const originalTitleCreateSchema = z.object({
  workingTitle: z.string().trim().min(1).max(240),
  format: z.enum(IPFormat),
  genre: z.string().trim().max(120).optional(),
  logline: z.string().trim().max(1000).optional(),
  synopsis: z.string().trim().max(10_000).optional(),
  runtimeMinutes: z.number().int().positive().max(1000).optional(),
  episodeCount: z.number().int().positive().max(10_000).optional(),
  rightsStatus: z.enum(RightsStatus).default(RightsStatus.UNKNOWN),
  developmentBudget: money.default(0),
  productionBudget: money.default(0),
  releaseBudget: money.default(0),
  currency,
});
export const leadStageSchema = z.object({ stage: z.enum(LeadStage), reason: z.string().trim().max(1000).optional() });
export const intakeStatusSchema = z.object({ status: z.enum(IntakeStatus) });
export const quoteStatusSchema = z.object({ status: z.enum(QuoteStatus), reason: z.string().trim().max(1000).optional() });
export const proposalStatusSchema = z.object({ status: z.enum(ProposalStatus) });
export const proposalAcceptanceSchema = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.email().trim().toLowerCase(),
  accepted: z.literal(true),
});
export const projectTransitionSchema = z.object({ status: z.enum(ProjectStatus), reason: z.string().trim().max(1000).optional() });
export const approvalCreateSchema = z.object({
  type: z.enum(ApprovalType),
  reviewId: id.optional(),
  requestedFromId: id.optional(),
});
export const approvalDecisionSchema = z.object({
  status: z.enum([ApprovalStatus.APPROVED, ApprovalStatus.REJECTED, ApprovalStatus.CHANGES_REQUESTED, ApprovalStatus.CANCELLED]),
  reason: z.string().trim().max(2000).optional(),
});
export const revisionCreateSchema = z.object({
  reviewId: id.optional(),
  category: z.enum(RevisionCategory),
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1).max(5000),
  includedInScope: z.boolean().default(false),
  estimatedCost: money.optional(),
  estimatedHours: z.coerce.number().finite().nonnegative().optional(),
});
export const changeOrderCreateSchema = z.object({
  contractId: id.optional(),
  number: z.string().trim().min(1).max(80),
  reason: z.string().trim().min(1).max(2000),
  currency,
  timelineImpactDays: z.number().int().min(-3650).max(3650).default(0),
  lines: z.array(z.object({
    description: z.string().trim().min(1).max(500),
    quantity: z.coerce.number().positive(),
    unitCost: money,
    unitPrice: money,
  })).min(1).max(200),
});
export const changeOrderStatusSchema = z.object({ status: z.enum(ProposalStatus) });
export const paymentSchema = z.object({
  idempotencyKey: z.string().trim().min(8).max(200),
  provider: z.string().trim().max(80).optional(),
  externalId: z.string().trim().max(200).optional(),
  amount: money,
  currency,
  status: z.enum(PaymentStatus),
  receivedAt: optionalDate,
  failureReason: z.string().trim().max(2000).optional(),
});
export const assetSchema = z.object({
  projectId: id.optional(),
  clientId: id.optional(),
  category: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(240),
  storageKey: z.string().trim().min(1).max(1000),
  mimeType: z.string().trim().min(1).max(255),
  sizeBytes: z.coerce.bigint().nonnegative(),
  checksum: z.string().trim().max(256).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const outboxSchema = z.object({
  connectionId: id.optional(),
  eventType: z.string().trim().min(1).max(160),
  aggregateType: z.string().trim().min(1).max(160),
  aggregateId: id,
  idempotencyKey: z.string().trim().min(8).max(200),
  payload: z.record(z.string(), z.unknown()),
  availableAt: optionalDate,
});
export const workStatusSchema = z.object({ status: z.enum(WorkStatus) });
