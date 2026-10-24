-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'OPERATIONS_MANAGER', 'CREATIVE_DIRECTOR', 'PRODUCER_EDITOR', 'SALES_ACCOUNT', 'FINANCE', 'CLIENT', 'EXTERNAL_COLLABORATOR');

-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'DISCOVERY', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "ServicePath" AS ENUM ('VISUAL_PRODUCTION', 'MANAGED_MARKETING', 'COMBINED', 'ORIGINAL_ENTERTAINMENT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "IntakeStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'REVIEWED', 'COMPLETE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SHORT_TEXT', 'LONG_TEXT', 'NUMBER', 'CURRENCY', 'DATE', 'BOOLEAN', 'SINGLE_SELECT', 'MULTI_SELECT', 'FILE', 'EMAIL', 'PHONE', 'URL');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'INTERNAL_REVIEW', 'APPROVED', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'INTERNAL_REVIEW', 'SENT', 'VIEWED', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'SENT', 'SIGNED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('INTAKE', 'AWAITING_ASSETS', 'DISCOVERY_COMPLETE', 'CONCEPT_DEVELOPMENT', 'SCRIPT_DEVELOPMENT', 'SCRIPT_REVIEW', 'VISUAL_DEVELOPMENT', 'STORYBOARDING', 'PRODUCTION_READY', 'GENERATION', 'EDITING', 'INTERNAL_REVIEW', 'CLIENT_REVIEW', 'REVISIONS', 'FINAL_APPROVAL', 'AWAITING_FINAL_PAYMENT', 'DELIVERY', 'COMPLETED', 'ARCHIVED', 'ON_HOLD', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WorkStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'IN_REVIEW', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApprovalType" AS ENUM ('CONCEPT', 'SCRIPT', 'CHARACTER', 'PRODUCT_ACCURACY', 'STORYBOARD', 'ROUGH_CUT', 'FINAL_CUT', 'FINAL_DELIVERY', 'MARGIN_EXCEPTION', 'CONTRACT', 'OTHER');

-- CreateEnum
CREATE TYPE "RevisionCategory" AS ENUM ('INCLUDED_CORRECTION', 'TECHNICAL_DEFECT', 'CREATIVE_ADJUSTMENT', 'CLIENT_CHANGE_OF_DIRECTION', 'ADDITIONAL_DELIVERABLE', 'OUT_OF_SCOPE_REQUEST');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'OPEN', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOID');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BillingPeriod" AS ENUM ('MONTHLY', 'ANNUAL', 'ONE_TIME', 'USAGE');

-- CreateEnum
CREATE TYPE "AllocationMethod" AS ENUM ('ACTUAL_USAGE', 'WEIGHTED', 'FIXED_PERCENT', 'FALLBACK', 'NONE');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('ALLOWANCE', 'USAGE', 'PURCHASE', 'ADJUSTMENT', 'EXPIRATION');

-- CreateEnum
CREATE TYPE "GenerationStatus" AS ENUM ('PLANNED', 'QUEUED', 'RUNNING', 'APPROVED', 'REJECTED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('PENDING_SCAN', 'AVAILABLE', 'QUARANTINED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RightsStatus" AS ENUM ('UNKNOWN', 'PENDING', 'CLEARED', 'RESTRICTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('DRAFT', 'READY', 'BLOCKED', 'DELIVERED', 'ACCEPTED', 'REVOKED');

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'DEAD_LETTER', 'CANCELLED');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "IPFormat" AS ENUM ('SHORT_FILM', 'FEATURE_FILM', 'SERIES', 'MUSIC_VIDEO', 'TRAILER', 'PROOF_OF_CONCEPT', 'OTHER');

-- CreateEnum
CREATE TYPE "FinancingStatus" AS ENUM ('PROSPECTIVE', 'COMMITTED', 'RECEIVED', 'REJECTED', 'RETURNED');

-- CreateEnum
CREATE TYPE "RecoupmentBasis" AS ENUM ('GROSS_RECEIPTS', 'NET_RECEIPTS', 'DISTRIBUTABLE_PROFIT');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "timezone" TEXT NOT NULL DEFAULT 'America/Chicago',
    "minimumMargin" DECIMAL(5,4) NOT NULL DEFAULT 0.50,
    "targetMargin" DECIMAL(5,4) NOT NULL DEFAULT 0.55,
    "premiumMargin" DECIMAL(5,4) NOT NULL DEFAULT 0.60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "mfaRequired" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "requestedIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MfaEnrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "secretCiphertext" TEXT,
    "recoveryCodeHashes" TEXT[],
    "verifiedAt" TIMESTAMP(3),
    "disabledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MfaEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "organizationId" TEXT,
    "emailNormalized" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "succeeded" BOOLEAN NOT NULL,
    "failureReason" TEXT,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "id" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowSeconds" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "blockedUntil" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessRole" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "systemKey" "Role",

    CONSTRAINT "AccessRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "ownerId" TEXT,
    "businessName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "source" TEXT,
    "stage" "LeadStage" NOT NULL DEFAULT 'NEW',
    "serviceInterests" "ServicePath"[],
    "opportunityValue" DECIMAL(14,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "nextFollowUpAt" TIMESTAMP(3),
    "lostReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadStageHistory" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "fromStage" "LeadStage",
    "toStage" "LeadStage" NOT NULL,
    "reason" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadStageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmActivity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "clientId" TEXT,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextActionAt" TIMESTAMP(3),

    CONSTRAINT "CrmActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "website" TEXT,
    "industry" TEXT,
    "businessType" TEXT,
    "timezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "title" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "canApproveSpend" BOOLEAN NOT NULL DEFAULT false,
    "canApproveCreative" BOOLEAN NOT NULL DEFAULT false,
    "preferredCommunication" TEXT,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT,
    "name" TEXT NOT NULL,
    "profile" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT,
    "brandId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT,
    "price" DECIMAL(14,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "claims" JSONB,
    "restrictions" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireDefinition" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "servicePath" "ServicePath",
    "status" "RecordStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "QuestionnaireDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireVersion" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "retiredAt" TIMESTAMP(3),

    CONSTRAINT "QuestionnaireVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireSection" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "QuestionnaireSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionDefinition" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "helpText" TEXT,
    "type" "QuestionType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "recommended" BOOLEAN NOT NULL DEFAULT false,
    "internalOnly" BOOLEAN NOT NULL DEFAULT false,
    "allowsFile" BOOLEAN NOT NULL DEFAULT false,
    "validation" JSONB,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "QuestionDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionCondition" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sourceQuestionId" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "expectedValue" JSONB NOT NULL,

    CONSTRAINT "QuestionCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Intake" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "questionnaireVersionId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "servicePath" "ServicePath" NOT NULL,
    "status" "IntakeStatus" NOT NULL DEFAULT 'DRAFT',
    "completeness" INTEGER NOT NULL DEFAULT 0,
    "readiness" JSONB,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Intake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntakeAnswer" (
    "id" TEXT NOT NULL,
    "intakeId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "answeredById" TEXT,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntakeAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceSelection" (
    "id" TEXT NOT NULL,
    "intakeId" TEXT NOT NULL,
    "servicePath" "ServicePath" NOT NULL,
    "configuration" JSONB,

    CONSTRAINT "ServiceSelection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionBrief" (
    "id" TEXT NOT NULL,
    "intakeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "objectives" JSONB NOT NULL,
    "audience" JSONB,
    "creativeDirection" JSONB,
    "productionRequirements" JSONB,
    "sourceMaterials" JSONB,
    "rightsRequirements" JSONB,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "ProductionBrief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicePackage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "servicePath" "ServicePath" NOT NULL,
    "startingPrice" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "scope" JSONB NOT NULL,
    "limits" JSONB,
    "estimatedHours" DECIMAL(10,2),
    "internalCostCeiling" DECIMAL(14,2),
    "targetMargin" DECIMAL(5,4) NOT NULL DEFAULT 0.55,
    "exclusions" JSONB,
    "contractTerms" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ServicePackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogItem" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "servicePath" "ServicePath",
    "unit" TEXT NOT NULL,
    "baseCost" DECIMAL(14,2) NOT NULL,
    "basePrice" DECIMAL(14,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "configuration" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CatalogItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceBook" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PriceBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceBookItem" (
    "priceBookId" TEXT NOT NULL,
    "catalogItemId" TEXT NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "minimumQuantity" DECIMAL(10,2),
    "configuration" JSONB,

    CONSTRAINT "PriceBookItem_pkey" PRIMARY KEY ("priceBookId","catalogItemId")
);

-- CreateTable
CREATE TABLE "LaborRole" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LaborRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaborRate" (
    "id" TEXT NOT NULL,
    "laborRoleId" TEXT NOT NULL,
    "hourlyCost" DECIMAL(10,2) NOT NULL,
    "loadedHourlyCost" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),

    CONSTRAINT "LaborRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarginSetting" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "servicePath" "ServicePath",
    "minimumMargin" DECIMAL(5,4) NOT NULL,
    "targetMargin" DECIMAL(5,4) NOT NULL,
    "premiumMargin" DECIMAL(5,4) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarginSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OverheadRule" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "allocationMethod" "AllocationMethod" NOT NULL,
    "rate" DECIMAL(10,4),
    "fixedAmount" DECIMAL(14,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "servicePaths" "ServicePath"[],
    "excludesStandaloneHosting" BOOLEAN NOT NULL DEFAULT true,
    "configuration" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "OverheadRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT,
    "packageId" TEXT,
    "projectTitle" TEXT NOT NULL,
    "servicePath" "ServicePath" NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteVersion" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "configuration" JSONB,
    "laborSubtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "nonLaborSubtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "overhead" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "contingency" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "allInCost" DECIMAL(14,2) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "discount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "finalPrice" DECIMAL(14,2) NOT NULL,
    "targetMargin" DECIMAL(5,4) NOT NULL,
    "operatingProfit" DECIMAL(14,2) NOT NULL,
    "operatingMargin" DECIMAL(5,4) NOT NULL,
    "minimumPrice" DECIMAL(14,2) NOT NULL,
    "recommendedPrice" DECIMAL(14,2) NOT NULL,
    "premiumPrice" DECIMAL(14,2) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteLine" (
    "id" TEXT NOT NULL,
    "quoteVersionId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitCost" DECIMAL(14,2) NOT NULL,
    "clientUnitPrice" DECIMAL(14,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "internalOnly" BOOLEAN NOT NULL DEFAULT true,
    "servicePath" "ServicePath",
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuoteLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostEstimate" (
    "id" TEXT NOT NULL,
    "quoteVersionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "plannedAmount" DECIMAL(14,2) NOT NULL,
    "actualAmount" DECIMAL(14,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "configuration" JSONB,

    CONSTRAINT "CostEstimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstimateLine" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "laborRoleId" TEXT,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitCost" DECIMAL(14,2) NOT NULL,
    "totalCost" DECIMAL(14,2) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "EstimateLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarginOverride" (
    "id" TEXT NOT NULL,
    "quoteVersionId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "reason" TEXT NOT NULL,
    "minimumMargin" DECIMAL(5,4) NOT NULL,
    "proposedMargin" DECIMAL(5,4) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarginOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT,
    "quoteId" TEXT NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalVersion" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "templateKey" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "renderedDocumentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProposalVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalAcceptance" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "contactId" TEXT,
    "accepted" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ipAddress" TEXT,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProposalAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT,
    "proposalId" TEXT,
    "projectId" TEXT,
    "number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "effectiveAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signatureProvider" TEXT,
    "externalSignatureId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractVersion" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "body" JSONB NOT NULL,
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentSchedule" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "percentage" DECIMAL(5,4),
    "amount" DECIMAL(14,2),
    "dueTrigger" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "PaymentSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT,
    "projectId" TEXT,
    "number" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "subtotal" DECIMAL(14,2) NOT NULL,
    "tax" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2) NOT NULL,
    "amountPaid" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceLine" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT,
    "externalId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "receivedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT,
    "quoteId" TEXT,
    "originalTitleId" TEXT,
    "title" TEXT NOT NULL,
    "servicePath" "ServicePath" NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'INTAKE',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "budget" DECIMAL(14,2),
    "actualCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "startAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTeamMember" (
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectRole" TEXT NOT NULL,
    "permissions" JSONB,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectTeamMember_pkey" PRIMARY KEY ("projectId","userId")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "WorkStatus" NOT NULL DEFAULT 'TODO',
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "milestoneId" TEXT,
    "assigneeId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "WorkStatus" NOT NULL DEFAULT 'TODO',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "estimatedHours" DECIMAL(10,2),
    "actualHours" DECIMAL(10,2),
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionBible" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "lockedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "ProductionBible_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionBibleVersion" (
    "id" TEXT NOT NULL,
    "bibleId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "visualStyle" JSONB,
    "premise" TEXT,
    "script" TEXT,
    "characters" JSONB,
    "environments" JSONB,
    "productionRules" JSONB,
    "lockedDecisions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionBibleVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scene" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sceneNumber" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "location" TEXT,
    "timeOfDay" TEXT,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "Scene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shot" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "shotCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "intendedDurationSeconds" DECIMAL(8,2),
    "camera" JSONB,
    "blockingAction" JSONB,
    "dialogue" TEXT,
    "lighting" TEXT,
    "environment" TEXT,
    "generationParameters" JSONB,
    "expectedCredits" INTEGER NOT NULL DEFAULT 0,
    "actualCredits" INTEGER NOT NULL DEFAULT 0,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "status" "WorkStatus" NOT NULL DEFAULT 'TODO',
    "approvedTakeId" TEXT,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "Shot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Take" (
    "id" TEXT NOT NULL,
    "shotId" TEXT NOT NULL,
    "takeNumber" INTEGER NOT NULL,
    "assetId" TEXT,
    "modelRateId" TEXT,
    "creditsUsed" INTEGER NOT NULL DEFAULT 0,
    "status" "GenerationStatus" NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Take_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "clientId" TEXT,
    "ownerOrganizationId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "checksum" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "AssetStatus" NOT NULL DEFAULT 'PENDING_SCAN',
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetLink" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "purpose" TEXT,

    CONSTRAINT "AssetLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetRight" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "status" "RightsStatus" NOT NULL DEFAULT 'UNKNOWN',
    "ownerName" TEXT,
    "permissionType" TEXT,
    "territories" TEXT[],
    "channels" TEXT[],
    "exclusive" BOOLEAN NOT NULL DEFAULT false,
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "restrictions" JSONB,
    "evidenceAssetId" TEXT,

    CONSTRAINT "AssetRight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "assetId" TEXT,
    "type" "ApprovalType" NOT NULL,
    "round" INTEGER NOT NULL DEFAULT 1,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewComment" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "timecodeSeconds" DECIMAL(10,3),
    "parentId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "reviewId" TEXT,
    "type" "ApprovalType" NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "requestedFromId" TEXT,
    "decidedById" TEXT,
    "reason" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevisionRequest" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "reviewId" TEXT,
    "category" "RevisionCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "includedInScope" BOOLEAN NOT NULL DEFAULT false,
    "estimatedCost" DECIMAL(14,2),
    "estimatedHours" DECIMAL(10,2),
    "status" "WorkStatus" NOT NULL DEFAULT 'TODO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevisionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeOrder" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "contractId" TEXT,
    "number" TEXT NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "reason" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "totalCost" DECIMAL(14,2) NOT NULL,
    "totalPrice" DECIMAL(14,2) NOT NULL,
    "timelineImpactDays" INTEGER NOT NULL DEFAULT 0,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "ChangeOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeOrderLine" (
    "id" TEXT NOT NULL,
    "changeOrderId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitCost" DECIMAL(14,2) NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "ChangeOrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deliverable" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "assetId" TEXT,
    "name" TEXT NOT NULL,
    "format" TEXT,
    "aspectRatio" TEXT,
    "resolution" TEXT,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'DRAFT',
    "releasedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "releaseCondition" JSONB,

    CONSTRAINT "Deliverable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "billingPeriod" "BillingPeriod" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "division" TEXT NOT NULL,
    "pricingType" TEXT NOT NULL,
    "allocationMethod" "AllocationMethod" NOT NULL,
    "includedCredits" INTEGER,
    "billingDay" INTEGER,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "renewalAt" TIMESTAMP(3),
    "expenseCategory" TEXT NOT NULL,
    "configuration" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceSubscription" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "packageName" TEXT NOT NULL,
    "serviceLevel" INTEGER,
    "onboardingFee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "monthlyFee" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "minimumTermMonths" INTEGER,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "deliverables" JSONB NOT NULL,
    "founderHours" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "ServiceSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionAllocation" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "projectId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "method" "AllocationMethod" NOT NULL,
    "usageWeight" DECIMAL(12,4),
    "allocatedAmount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "rationale" TEXT,

    CONSTRAINT "SubscriptionAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelRate" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "resolution" TEXT,
    "durationSeconds" INTEGER,
    "audioMode" TEXT,
    "creditsPerGeneration" INTEGER NOT NULL,
    "referenceImageCredits" INTEGER NOT NULL DEFAULT 0,
    "upscaleCredits" INTEGER NOT NULL DEFAULT 0,
    "additionalFeatureCosts" JSONB,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),

    CONSTRAINT "ModelRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditLedgerEntry" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "projectId" TEXT,
    "generationEventId" TEXT,
    "type" "LedgerEntryType" NOT NULL,
    "credits" INTEGER NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "monetaryAmount" DECIMAL(14,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenerationEvent" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "shotId" TEXT,
    "modelRateId" TEXT,
    "attemptNumber" INTEGER NOT NULL,
    "status" "GenerationStatus" NOT NULL,
    "expectedCredits" INTEGER NOT NULL DEFAULT 0,
    "actualCredits" INTEGER NOT NULL DEFAULT 0,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "parameters" JSONB,
    "providerRequestId" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenerationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT,
    "category" TEXT NOT NULL,
    "vendor" TEXT,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "incurredAt" TIMESTAMP(3) NOT NULL,
    "billable" BOOLEAN NOT NULL DEFAULT false,
    "receiptAssetId" TEXT,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "channel" "NotificationChannel" NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailMessage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "toAddresses" TEXT[],
    "ccAddresses" TEXT[],
    "subject" TEXT NOT NULL,
    "templateKey" TEXT,
    "payload" JSONB,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "providerMessageId" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationConnection" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'DRAFT',
    "configuration" JSONB,
    "secretReference" TEXT,
    "lastSyncedAt" TIMESTAMP(3),

    CONSTRAINT "IntegrationConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationOutboxEvent" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT,
    "organizationId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationOutboxEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackgroundJob" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "type" TEXT NOT NULL,
    "dedupeKey" TEXT,
    "payload" JSONB NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'QUEUED',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BackgroundJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OriginalTitle" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "workingTitle" TEXT NOT NULL,
    "format" "IPFormat" NOT NULL,
    "genre" TEXT,
    "logline" TEXT,
    "synopsis" TEXT,
    "audience" JSONB,
    "visualStyle" JSONB,
    "runtimeMinutes" INTEGER,
    "episodeCount" INTEGER,
    "rightsStatus" "RightsStatus" NOT NULL DEFAULT 'UNKNOWN',
    "developmentBudget" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "productionBudget" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "releaseBudget" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OriginalTitle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RightsRecord" (
    "id" TEXT NOT NULL,
    "originalTitleId" TEXT NOT NULL,
    "rightType" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "ownershipPercent" DECIMAL(7,4),
    "status" "RightsStatus" NOT NULL,
    "territories" TEXT[],
    "media" TEXT[],
    "exclusive" BOOLEAN NOT NULL DEFAULT false,
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "terms" JSONB,

    CONSTRAINT "RightsRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancingSource" (
    "id" TEXT NOT NULL,
    "originalTitleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "FinancingStatus" NOT NULL DEFAULT 'PROSPECTIVE',
    "committedAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "receivedAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "terms" JSONB,

    CONSTRAINT "FinancingSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancingContribution" (
    "id" TEXT NOT NULL,
    "financingSourceId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "reference" TEXT,

    CONSTRAINT "FinancingContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistributionAssumption" (
    "id" TEXT NOT NULL,
    "originalTitleId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "territory" TEXT,
    "grossReceipts" DECIMAL(14,2) NOT NULL,
    "distributionFeeRate" DECIMAL(7,4) NOT NULL DEFAULT 0,
    "distributionExpenses" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "netReceipts" DECIMAL(14,2) NOT NULL,
    "probability" DECIMAL(5,4),
    "notes" TEXT,

    CONSTRAINT "DistributionAssumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecoupmentTier" (
    "id" TEXT NOT NULL,
    "originalTitleId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "participant" TEXT NOT NULL,
    "basis" "RecoupmentBasis" NOT NULL,
    "recoupableAmount" DECIMAL(14,2),
    "shareRate" DECIMAL(7,4) NOT NULL,
    "capAmount" DECIMAL(14,2),
    "terms" JSONB,

    CONSTRAINT "RecoupmentTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialProjection" (
    "id" TEXT NOT NULL,
    "originalTitleId" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "productionCost" DECIMAL(14,2) NOT NULL,
    "releaseCost" DECIMAL(14,2) NOT NULL,
    "grossReceipts" DECIMAL(14,2) NOT NULL,
    "distributionDeductions" DECIMAL(14,2) NOT NULL,
    "netReceipts" DECIMAL(14,2) NOT NULL,
    "recoupment" DECIMAL(14,2) NOT NULL,
    "projectedProfit" DECIMAL(14,2) NOT NULL,
    "breakEvenRevenue" DECIMAL(14,2) NOT NULL,
    "revenueAt50Margin" DECIMAL(14,2) NOT NULL,
    "revenueAt55Margin" DECIMAL(14,2) NOT NULL,
    "revenueAt60Margin" DECIMAL(14,2) NOT NULL,
    "speculative" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialProjection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationRule" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL,
    "conditions" JSONB,
    "actions" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "requiresHumanApproval" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AutomationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationRun" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "triggerEventId" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'QUEUED',
    "input" JSONB NOT NULL,
    "output" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "reason" TEXT,
    "ipAddress" TEXT,
    "correlationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "User_organizationId_role_active_idx" ON "User"("organizationId", "role", "active");

-- CreateIndex
CREATE UNIQUE INDEX "User_organizationId_email_key" ON "User"("organizationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "Session_expiresAt_revokedAt_idx" ON "Session"("expiresAt", "revokedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_expiresAt_idx" ON "PasswordResetToken"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "MfaEnrollment_userId_key" ON "MfaEnrollment"("userId");

-- CreateIndex
CREATE INDEX "LoginAttempt_emailNormalized_attemptedAt_idx" ON "LoginAttempt"("emailNormalized", "attemptedAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_ipAddress_attemptedAt_idx" ON "LoginAttempt"("ipAddress", "attemptedAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_userId_attemptedAt_idx" ON "LoginAttempt"("userId", "attemptedAt");

-- CreateIndex
CREATE INDEX "RateLimitBucket_action_blockedUntil_idx" ON "RateLimitBucket"("action", "blockedUntil");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimitBucket_keyHash_action_windowStart_key" ON "RateLimitBucket"("keyHash", "action", "windowStart");

-- CreateIndex
CREATE UNIQUE INDEX "AccessRole_organizationId_name_key" ON "AccessRole"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE INDEX "Lead_organizationId_stage_idx" ON "Lead"("organizationId", "stage");

-- CreateIndex
CREATE INDEX "Lead_ownerId_nextFollowUpAt_idx" ON "Lead"("ownerId", "nextFollowUpAt");

-- CreateIndex
CREATE INDEX "LeadStageHistory_leadId_changedAt_idx" ON "LeadStageHistory"("leadId", "changedAt");

-- CreateIndex
CREATE INDEX "CrmActivity_leadId_occurredAt_idx" ON "CrmActivity"("leadId", "occurredAt");

-- CreateIndex
CREATE INDEX "CrmActivity_clientId_occurredAt_idx" ON "CrmActivity"("clientId", "occurredAt");

-- CreateIndex
CREATE INDEX "Client_organizationId_idx" ON "Client"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_organizationId_displayName_key" ON "Client"("organizationId", "displayName");

-- CreateIndex
CREATE INDEX "Contact_clientId_isPrimary_idx" ON "Contact"("clientId", "isPrimary");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_clientId_email_key" ON "Contact"("clientId", "email");

-- CreateIndex
CREATE INDEX "Brand_organizationId_clientId_idx" ON "Brand"("organizationId", "clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_organizationId_clientId_name_key" ON "Brand"("organizationId", "clientId", "name");

-- CreateIndex
CREATE INDEX "Product_clientId_brandId_idx" ON "Product"("clientId", "brandId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_organizationId_sku_key" ON "Product"("organizationId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionnaireDefinition_organizationId_key_key" ON "QuestionnaireDefinition"("organizationId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionnaireVersion_definitionId_version_key" ON "QuestionnaireVersion"("definitionId", "version");

-- CreateIndex
CREATE INDEX "QuestionnaireSection_versionId_sortOrder_idx" ON "QuestionnaireSection"("versionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionnaireSection_versionId_key_key" ON "QuestionnaireSection"("versionId", "key");

-- CreateIndex
CREATE INDEX "QuestionDefinition_sectionId_sortOrder_idx" ON "QuestionDefinition"("sectionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionDefinition_sectionId_key_key" ON "QuestionDefinition"("sectionId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionOption_questionId_value_key" ON "QuestionOption"("questionId", "value");

-- CreateIndex
CREATE INDEX "QuestionCondition_questionId_idx" ON "QuestionCondition"("questionId");

-- CreateIndex
CREATE INDEX "QuestionCondition_sourceQuestionId_idx" ON "QuestionCondition"("sourceQuestionId");

-- CreateIndex
CREATE INDEX "Intake_clientId_status_idx" ON "Intake"("clientId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Intake_clientId_questionnaireVersionId_version_key" ON "Intake"("clientId", "questionnaireVersionId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "IntakeAnswer_intakeId_questionId_key" ON "IntakeAnswer"("intakeId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceSelection_intakeId_servicePath_key" ON "ServiceSelection"("intakeId", "servicePath");

-- CreateIndex
CREATE INDEX "ProductionBrief_intakeId_idx" ON "ProductionBrief"("intakeId");

-- CreateIndex
CREATE INDEX "ServicePackage_organizationId_servicePath_active_idx" ON "ServicePackage"("organizationId", "servicePath", "active");

-- CreateIndex
CREATE UNIQUE INDEX "ServicePackage_organizationId_name_key" ON "ServicePackage"("organizationId", "name");

-- CreateIndex
CREATE INDEX "CatalogItem_organizationId_category_active_idx" ON "CatalogItem"("organizationId", "category", "active");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogItem_organizationId_sku_key" ON "CatalogItem"("organizationId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "PriceBook_organizationId_name_key" ON "PriceBook"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "LaborRole_organizationId_name_key" ON "LaborRole"("organizationId", "name");

-- CreateIndex
CREATE INDEX "LaborRate_laborRoleId_effectiveFrom_idx" ON "LaborRate"("laborRoleId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "MarginSetting_organizationId_servicePath_effectiveFrom_idx" ON "MarginSetting"("organizationId", "servicePath", "effectiveFrom");

-- CreateIndex
CREATE INDEX "OverheadRule_organizationId_active_idx" ON "OverheadRule"("organizationId", "active");

-- CreateIndex
CREATE INDEX "Quote_organizationId_status_idx" ON "Quote"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Quote_clientId_createdAt_idx" ON "Quote"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "QuoteVersion_quoteId_status_idx" ON "QuoteVersion"("quoteId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteVersion_quoteId_version_key" ON "QuoteVersion"("quoteId", "version");

-- CreateIndex
CREATE INDEX "QuoteLine_quoteVersionId_category_idx" ON "QuoteLine"("quoteVersionId", "category");

-- CreateIndex
CREATE INDEX "CostEstimate_quoteVersionId_kind_idx" ON "CostEstimate"("quoteVersionId", "kind");

-- CreateIndex
CREATE INDEX "EstimateLine_estimateId_idx" ON "EstimateLine"("estimateId");

-- CreateIndex
CREATE INDEX "MarginOverride_quoteVersionId_approvedAt_idx" ON "MarginOverride"("quoteVersionId", "approvedAt");

-- CreateIndex
CREATE INDEX "Proposal_organizationId_status_idx" ON "Proposal"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ProposalVersion_proposalId_version_key" ON "ProposalVersion"("proposalId", "version");

-- CreateIndex
CREATE INDEX "ProposalAcceptance_proposalId_acceptedAt_idx" ON "ProposalAcceptance"("proposalId", "acceptedAt");

-- CreateIndex
CREATE INDEX "Contract_clientId_status_idx" ON "Contract"("clientId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_organizationId_number_key" ON "Contract"("organizationId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "ContractVersion_contractId_version_key" ON "ContractVersion"("contractId", "version");

-- CreateIndex
CREATE INDEX "PaymentSchedule_contractId_sortOrder_idx" ON "PaymentSchedule"("contractId", "sortOrder");

-- CreateIndex
CREATE INDEX "Invoice_clientId_status_idx" ON "Invoice"("clientId", "status");

-- CreateIndex
CREATE INDEX "Invoice_projectId_idx" ON "Invoice"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_organizationId_number_key" ON "Invoice"("organizationId", "number");

-- CreateIndex
CREATE INDEX "InvoiceLine_invoiceId_idx" ON "InvoiceLine"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Payment_invoiceId_status_idx" ON "Payment"("invoiceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Project_quoteId_key" ON "Project"("quoteId");

-- CreateIndex
CREATE INDEX "Project_organizationId_status_idx" ON "Project"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Project_clientId_idx" ON "Project"("clientId");

-- CreateIndex
CREATE INDEX "Project_originalTitleId_idx" ON "Project"("originalTitleId");

-- CreateIndex
CREATE INDEX "ProjectTeamMember_userId_idx" ON "ProjectTeamMember"("userId");

-- CreateIndex
CREATE INDEX "Milestone_projectId_sortOrder_idx" ON "Milestone"("projectId", "sortOrder");

-- CreateIndex
CREATE INDEX "Task_projectId_status_idx" ON "Task"("projectId", "status");

-- CreateIndex
CREATE INDEX "Task_assigneeId_status_dueAt_idx" ON "Task"("assigneeId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "ProductionBible_projectId_idx" ON "ProductionBible"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionBibleVersion_bibleId_version_key" ON "ProductionBibleVersion"("bibleId", "version");

-- CreateIndex
CREATE INDEX "Scene_projectId_sortOrder_idx" ON "Scene"("projectId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Scene_projectId_sceneNumber_key" ON "Scene"("projectId", "sceneNumber");

-- CreateIndex
CREATE INDEX "Shot_sceneId_sortOrder_idx" ON "Shot"("sceneId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Shot_sceneId_shotCode_key" ON "Shot"("sceneId", "shotCode");

-- CreateIndex
CREATE UNIQUE INDEX "Take_shotId_takeNumber_key" ON "Take"("shotId", "takeNumber");

-- CreateIndex
CREATE INDEX "Asset_projectId_category_idx" ON "Asset"("projectId", "category");

-- CreateIndex
CREATE INDEX "Asset_clientId_category_idx" ON "Asset"("clientId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_ownerOrganizationId_storageKey_key" ON "Asset"("ownerOrganizationId", "storageKey");

-- CreateIndex
CREATE INDEX "AssetLink_entityType_entityId_idx" ON "AssetLink"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "AssetLink_assetId_entityType_entityId_purpose_key" ON "AssetLink"("assetId", "entityType", "entityId", "purpose");

-- CreateIndex
CREATE INDEX "AssetRight_assetId_status_idx" ON "AssetRight"("assetId", "status");

-- CreateIndex
CREATE INDEX "AssetRight_expiresAt_idx" ON "AssetRight"("expiresAt");

-- CreateIndex
CREATE INDEX "Review_projectId_status_idx" ON "Review"("projectId", "status");

-- CreateIndex
CREATE INDEX "ReviewComment_reviewId_createdAt_idx" ON "ReviewComment"("reviewId", "createdAt");

-- CreateIndex
CREATE INDEX "Approval_projectId_type_status_idx" ON "Approval"("projectId", "type", "status");

-- CreateIndex
CREATE INDEX "RevisionRequest_projectId_category_status_idx" ON "RevisionRequest"("projectId", "category", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ChangeOrder_projectId_number_key" ON "ChangeOrder"("projectId", "number");

-- CreateIndex
CREATE INDEX "ChangeOrderLine_changeOrderId_idx" ON "ChangeOrderLine"("changeOrderId");

-- CreateIndex
CREATE INDEX "Deliverable_projectId_status_idx" ON "Deliverable"("projectId", "status");

-- CreateIndex
CREATE INDEX "Subscription_organizationId_active_idx" ON "Subscription"("organizationId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_organizationId_provider_name_key" ON "Subscription"("organizationId", "provider", "name");

-- CreateIndex
CREATE INDEX "ServiceSubscription_clientId_status_idx" ON "ServiceSubscription"("clientId", "status");

-- CreateIndex
CREATE INDEX "SubscriptionAllocation_projectId_periodStart_idx" ON "SubscriptionAllocation"("projectId", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionAllocation_subscriptionId_projectId_periodStart_key" ON "SubscriptionAllocation"("subscriptionId", "projectId", "periodStart");

-- CreateIndex
CREATE INDEX "ModelRate_organizationId_provider_model_effectiveFrom_idx" ON "ModelRate"("organizationId", "provider", "model", "effectiveFrom");

-- CreateIndex
CREATE INDEX "CreditLedgerEntry_subscriptionId_periodStart_idx" ON "CreditLedgerEntry"("subscriptionId", "periodStart");

-- CreateIndex
CREATE INDEX "CreditLedgerEntry_projectId_createdAt_idx" ON "CreditLedgerEntry"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "GenerationEvent_projectId_status_idx" ON "GenerationEvent"("projectId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "GenerationEvent_projectId_shotId_attemptNumber_key" ON "GenerationEvent"("projectId", "shotId", "attemptNumber");

-- CreateIndex
CREATE INDEX "Expense_organizationId_incurredAt_idx" ON "Expense"("organizationId", "incurredAt");

-- CreateIndex
CREATE INDEX "Expense_projectId_category_idx" ON "Expense"("projectId", "category");

-- CreateIndex
CREATE INDEX "Notification_organizationId_userId_readAt_idx" ON "Notification"("organizationId", "userId", "readAt");

-- CreateIndex
CREATE INDEX "EmailMessage_organizationId_status_createdAt_idx" ON "EmailMessage"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationConnection_organizationId_provider_name_key" ON "IntegrationConnection"("organizationId", "provider", "name");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationOutboxEvent_idempotencyKey_key" ON "IntegrationOutboxEvent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "IntegrationOutboxEvent_status_availableAt_idx" ON "IntegrationOutboxEvent"("status", "availableAt");

-- CreateIndex
CREATE INDEX "IntegrationOutboxEvent_organizationId_aggregateType_aggrega_idx" ON "IntegrationOutboxEvent"("organizationId", "aggregateType", "aggregateId");

-- CreateIndex
CREATE UNIQUE INDEX "BackgroundJob_dedupeKey_key" ON "BackgroundJob"("dedupeKey");

-- CreateIndex
CREATE INDEX "BackgroundJob_status_runAt_priority_idx" ON "BackgroundJob"("status", "runAt", "priority");

-- CreateIndex
CREATE INDEX "OriginalTitle_organizationId_rightsStatus_idx" ON "OriginalTitle"("organizationId", "rightsStatus");

-- CreateIndex
CREATE UNIQUE INDEX "OriginalTitle_organizationId_workingTitle_key" ON "OriginalTitle"("organizationId", "workingTitle");

-- CreateIndex
CREATE INDEX "RightsRecord_originalTitleId_status_idx" ON "RightsRecord"("originalTitleId", "status");

-- CreateIndex
CREATE INDEX "FinancingSource_originalTitleId_status_idx" ON "FinancingSource"("originalTitleId", "status");

-- CreateIndex
CREATE INDEX "FinancingContribution_financingSourceId_receivedAt_idx" ON "FinancingContribution"("financingSourceId", "receivedAt");

-- CreateIndex
CREATE INDEX "DistributionAssumption_originalTitleId_channel_idx" ON "DistributionAssumption"("originalTitleId", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "RecoupmentTier_originalTitleId_priority_key" ON "RecoupmentTier"("originalTitleId", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialProjection_originalTitleId_scenario_key" ON "FinancialProjection"("originalTitleId", "scenario");

-- CreateIndex
CREATE INDEX "AutomationRule_organizationId_active_idx" ON "AutomationRule"("organizationId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "AutomationRule_organizationId_name_key" ON "AutomationRule"("organizationId", "name");

-- CreateIndex
CREATE INDEX "AutomationRun_ruleId_createdAt_idx" ON "AutomationRun"("ruleId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_organizationId_entityType_entityId_idx" ON "AuditEvent"("organizationId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditEvent_organizationId_createdAt_idx" ON "AuditEvent"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_correlationId_idx" ON "AuditEvent"("correlationId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MfaEnrollment" ADD CONSTRAINT "MfaEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginAttempt" ADD CONSTRAINT "LoginAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRole" ADD CONSTRAINT "AccessRole_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "AccessRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "AccessRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadStageHistory" ADD CONSTRAINT "LeadStageHistory_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireDefinition" ADD CONSTRAINT "QuestionnaireDefinition_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireVersion" ADD CONSTRAINT "QuestionnaireVersion_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "QuestionnaireDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireSection" ADD CONSTRAINT "QuestionnaireSection_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "QuestionnaireVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionDefinition" ADD CONSTRAINT "QuestionDefinition_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "QuestionnaireSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionCondition" ADD CONSTRAINT "QuestionCondition_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionCondition" ADD CONSTRAINT "QuestionCondition_sourceQuestionId_fkey" FOREIGN KEY ("sourceQuestionId") REFERENCES "QuestionDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intake" ADD CONSTRAINT "Intake_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intake" ADD CONSTRAINT "Intake_questionnaireVersionId_fkey" FOREIGN KEY ("questionnaireVersionId") REFERENCES "QuestionnaireVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeAnswer" ADD CONSTRAINT "IntakeAnswer_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "Intake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeAnswer" ADD CONSTRAINT "IntakeAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceSelection" ADD CONSTRAINT "ServiceSelection_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "Intake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionBrief" ADD CONSTRAINT "ProductionBrief_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "Intake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePackage" ADD CONSTRAINT "ServicePackage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogItem" ADD CONSTRAINT "CatalogItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceBook" ADD CONSTRAINT "PriceBook_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceBookItem" ADD CONSTRAINT "PriceBookItem_priceBookId_fkey" FOREIGN KEY ("priceBookId") REFERENCES "PriceBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceBookItem" ADD CONSTRAINT "PriceBookItem_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "CatalogItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaborRole" ADD CONSTRAINT "LaborRole_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaborRate" ADD CONSTRAINT "LaborRate_laborRoleId_fkey" FOREIGN KEY ("laborRoleId") REFERENCES "LaborRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarginSetting" ADD CONSTRAINT "MarginSetting_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverheadRule" ADD CONSTRAINT "OverheadRule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "ServicePackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteVersion" ADD CONSTRAINT "QuoteVersion_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteLine" ADD CONSTRAINT "QuoteLine_quoteVersionId_fkey" FOREIGN KEY ("quoteVersionId") REFERENCES "QuoteVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostEstimate" ADD CONSTRAINT "CostEstimate_quoteVersionId_fkey" FOREIGN KEY ("quoteVersionId") REFERENCES "QuoteVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimateLine" ADD CONSTRAINT "EstimateLine_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "CostEstimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarginOverride" ADD CONSTRAINT "MarginOverride_quoteVersionId_fkey" FOREIGN KEY ("quoteVersionId") REFERENCES "QuoteVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalVersion" ADD CONSTRAINT "ProposalVersion_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalAcceptance" ADD CONSTRAINT "ProposalAcceptance_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractVersion" ADD CONSTRAINT "ContractVersion_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSchedule" ADD CONSTRAINT "PaymentSchedule_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_originalTitleId_fkey" FOREIGN KEY ("originalTitleId") REFERENCES "OriginalTitle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTeamMember" ADD CONSTRAINT "ProjectTeamMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTeamMember" ADD CONSTRAINT "ProjectTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionBible" ADD CONSTRAINT "ProductionBible_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionBibleVersion" ADD CONSTRAINT "ProductionBibleVersion_bibleId_fkey" FOREIGN KEY ("bibleId") REFERENCES "ProductionBible"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shot" ADD CONSTRAINT "Shot_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Take" ADD CONSTRAINT "Take_shotId_fkey" FOREIGN KEY ("shotId") REFERENCES "Shot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetLink" ADD CONSTRAINT "AssetLink_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetRight" ADD CONSTRAINT "AssetRight_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewComment" ADD CONSTRAINT "ReviewComment_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionRequest" ADD CONSTRAINT "RevisionRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeOrder" ADD CONSTRAINT "ChangeOrder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeOrder" ADD CONSTRAINT "ChangeOrder_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeOrderLine" ADD CONSTRAINT "ChangeOrderLine_changeOrderId_fkey" FOREIGN KEY ("changeOrderId") REFERENCES "ChangeOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceSubscription" ADD CONSTRAINT "ServiceSubscription_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceSubscription" ADD CONSTRAINT "ServiceSubscription_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionAllocation" ADD CONSTRAINT "SubscriptionAllocation_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionAllocation" ADD CONSTRAINT "SubscriptionAllocation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelRate" ADD CONSTRAINT "ModelRate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLedgerEntry" ADD CONSTRAINT "CreditLedgerEntry_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLedgerEntry" ADD CONSTRAINT "CreditLedgerEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLedgerEntry" ADD CONSTRAINT "CreditLedgerEntry_generationEventId_fkey" FOREIGN KEY ("generationEventId") REFERENCES "GenerationEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationEvent" ADD CONSTRAINT "GenerationEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationEvent" ADD CONSTRAINT "GenerationEvent_shotId_fkey" FOREIGN KEY ("shotId") REFERENCES "Shot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationEvent" ADD CONSTRAINT "GenerationEvent_modelRateId_fkey" FOREIGN KEY ("modelRateId") REFERENCES "ModelRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationConnection" ADD CONSTRAINT "IntegrationConnection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationOutboxEvent" ADD CONSTRAINT "IntegrationOutboxEvent_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "IntegrationConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OriginalTitle" ADD CONSTRAINT "OriginalTitle_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RightsRecord" ADD CONSTRAINT "RightsRecord_originalTitleId_fkey" FOREIGN KEY ("originalTitleId") REFERENCES "OriginalTitle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancingSource" ADD CONSTRAINT "FinancingSource_originalTitleId_fkey" FOREIGN KEY ("originalTitleId") REFERENCES "OriginalTitle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancingContribution" ADD CONSTRAINT "FinancingContribution_financingSourceId_fkey" FOREIGN KEY ("financingSourceId") REFERENCES "FinancingSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistributionAssumption" ADD CONSTRAINT "DistributionAssumption_originalTitleId_fkey" FOREIGN KEY ("originalTitleId") REFERENCES "OriginalTitle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoupmentTier" ADD CONSTRAINT "RecoupmentTier_originalTitleId_fkey" FOREIGN KEY ("originalTitleId") REFERENCES "OriginalTitle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialProjection" ADD CONSTRAINT "FinancialProjection_originalTitleId_fkey" FOREIGN KEY ("originalTitleId") REFERENCES "OriginalTitle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationRule" ADD CONSTRAINT "AutomationRule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationRun" ADD CONSTRAINT "AutomationRun_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "AutomationRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

