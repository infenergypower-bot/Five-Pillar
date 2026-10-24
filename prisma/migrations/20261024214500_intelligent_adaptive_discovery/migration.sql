-- CreateEnum
CREATE TYPE "DiscoveryReadinessStatus" AS ENUM ('DISCOVERY_INCOMPLETE', 'CLARIFICATION_REQUIRED', 'READY_FOR_PRELIMINARY_ESTIMATE', 'READY_FOR_FIRM_QUOTATION', 'READY_FOR_CREATIVE_DEVELOPMENT', 'READY_FOR_PRODUCTION', 'READY_FOR_FINAL_DELIVERY');

-- CreateEnum
CREATE TYPE "AnswerSource" AS ENUM ('CLIENT', 'AUTHORIZED_STAFF', 'STAKEHOLDER', 'DOCUMENT_EXTRACTION', 'REUSED_VERIFIED_ANSWER', 'AI_RECOMMENDATION');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'CLIENT_CONFIRMED', 'STAFF_VERIFIED', 'REJECTED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "ClarificationStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "DiscoveryRiskSeverity" AS ENUM ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'BLOCKING');

-- CreateEnum
CREATE TYPE "DiscoveryOutputType" AS ENUM ('CLIENT_BUSINESS_PROFILE', 'BRAND_INTELLIGENCE_PROFILE', 'TARGET_AUDIENCE_PROFILE', 'CREATIVE_DIRECTION_BRIEF', 'TECHNICAL_PRODUCTION_SPECIFICATION', 'SCRIPT_DEVELOPMENT_BRIEF', 'CHARACTER_ENVIRONMENT_REQUIREMENTS', 'SHOT_SCENE_ESTIMATE', 'LABOR_ESTIMATE', 'AI_GENERATION_REQUIREMENTS', 'PRELIMINARY_PRICING_ESTIMATE', 'PRODUCTION_READINESS_CHECKLIST', 'ALPHI_INTEGRATION_PAYLOAD');

-- CreateEnum
CREATE TYPE "DiscoveryImpactStatus" AS ENUM ('OPEN', 'REVIEWED', 'ACCEPTED', 'DISMISSED');

-- AlterTable
ALTER TABLE "QuestionnaireDefinition" ADD COLUMN     "serviceTypeId" TEXT;

-- AlterTable
ALTER TABLE "QuestionDefinition" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "clarification" JSONB,
ADD COLUMN     "critical" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "destination" JSONB,
ADD COLUMN     "reuseKey" TEXT;

-- AlterTable
ALTER TABLE "Intake" ADD COLUMN     "compiledBriefVersion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "confirmedBriefVersion" INTEGER,
ADD COLUMN     "confirmedById" TEXT,
ADD COLUMN     "lockedAt" TIMESTAMP(3),
ADD COLUMN     "projectId" TEXT,
ADD COLUMN     "readinessAssessedAt" TIMESTAMP(3),
ADD COLUMN     "readinessStatus" "DiscoveryReadinessStatus" NOT NULL DEFAULT 'DISCOVERY_INCOMPLETE',
ADD COLUMN     "serviceTypeId" TEXT;

-- AlterTable
ALTER TABLE "IntakeAnswer" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "source" "AnswerSource" NOT NULL DEFAULT 'CLIENT',
ADD COLUMN     "sourceReference" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedById" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

UPDATE "IntakeAnswer" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;
ALTER TABLE "IntakeAnswer" ALTER COLUMN "updatedAt" SET NOT NULL;

-- CreateTable
CREATE TABLE "ServiceTypeDefinition" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "configuration" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceTypeDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntakeAnswerRevision" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "value" JSONB NOT NULL,
    "source" "AnswerSource" NOT NULL,
    "sourceReference" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL,
    "changedById" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changeReason" TEXT,

    CONSTRAINT "IntakeAnswerRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscoveryMaterial" (
    "id" TEXT NOT NULL,
    "intakeId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "extractedData" JSONB,
    "extractionProvider" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscoveryMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscoveryClarification" (
    "id" TEXT NOT NULL,
    "intakeId" TEXT NOT NULL,
    "questionId" TEXT,
    "origin" "AnswerSource" NOT NULL,
    "reasonCode" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "rationale" TEXT,
    "status" "ClarificationStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" JSONB,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscoveryClarification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscoveryRisk" (
    "id" TEXT NOT NULL,
    "intakeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "DiscoveryRiskSeverity" NOT NULL,
    "category" TEXT NOT NULL,
    "blocking" BOOLEAN NOT NULL DEFAULT false,
    "evidence" JSONB,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscoveryRisk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscoveryOutput" (
    "id" TEXT NOT NULL,
    "intakeId" TEXT NOT NULL,
    "type" "DiscoveryOutputType" NOT NULL,
    "version" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "sourceAnswerKeys" TEXT[],
    "targetType" TEXT,
    "targetId" TEXT,
    "generatedBy" TEXT NOT NULL,
    "verifiedOnly" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscoveryOutput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscoveryImpact" (
    "id" TEXT NOT NULL,
    "intakeId" TEXT NOT NULL,
    "answerKey" TEXT NOT NULL,
    "priorValue" JSONB,
    "newValue" JSONB NOT NULL,
    "affectedAreas" TEXT[],
    "affectedRecordIds" TEXT[],
    "explanation" TEXT NOT NULL,
    "status" "DiscoveryImpactStatus" NOT NULL DEFAULT 'OPEN',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscoveryImpact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscoveryCollaborator" (
    "id" TEXT NOT NULL,
    "intakeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permissions" TEXT[],
    "invitedById" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscoveryCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscoveryConfirmation" (
    "id" TEXT NOT NULL,
    "intakeId" TEXT NOT NULL,
    "briefVersion" INTEGER NOT NULL,
    "confirmedById" TEXT,
    "confirmerName" TEXT NOT NULL,
    "confirmerEmail" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmation" JSONB NOT NULL,

    CONSTRAINT "DiscoveryConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceTypeDefinition_organizationId_active_idx" ON "ServiceTypeDefinition"("organizationId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceTypeDefinition_organizationId_key_key" ON "ServiceTypeDefinition"("organizationId", "key");

-- CreateIndex
CREATE INDEX "IntakeAnswerRevision_answerId_changedAt_idx" ON "IntakeAnswerRevision"("answerId", "changedAt");

-- CreateIndex
CREATE UNIQUE INDEX "IntakeAnswerRevision_answerId_version_key" ON "IntakeAnswerRevision"("answerId", "version");

-- CreateIndex
CREATE INDEX "DiscoveryMaterial_intakeId_verificationStatus_idx" ON "DiscoveryMaterial"("intakeId", "verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "DiscoveryMaterial_intakeId_assetId_key" ON "DiscoveryMaterial"("intakeId", "assetId");

-- CreateIndex
CREATE INDEX "DiscoveryClarification_intakeId_status_idx" ON "DiscoveryClarification"("intakeId", "status");

-- CreateIndex
CREATE INDEX "DiscoveryRisk_intakeId_blocking_severity_idx" ON "DiscoveryRisk"("intakeId", "blocking", "severity");

-- CreateIndex
CREATE UNIQUE INDEX "DiscoveryRisk_intakeId_code_key" ON "DiscoveryRisk"("intakeId", "code");

-- CreateIndex
CREATE INDEX "DiscoveryOutput_intakeId_type_idx" ON "DiscoveryOutput"("intakeId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "DiscoveryOutput_intakeId_type_version_key" ON "DiscoveryOutput"("intakeId", "type", "version");

-- CreateIndex
CREATE INDEX "DiscoveryImpact_intakeId_status_idx" ON "DiscoveryImpact"("intakeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DiscoveryCollaborator_intakeId_email_key" ON "DiscoveryCollaborator"("intakeId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "DiscoveryConfirmation_intakeId_briefVersion_key" ON "DiscoveryConfirmation"("intakeId", "briefVersion");

-- CreateIndex
CREATE INDEX "Intake_projectId_idx" ON "Intake"("projectId");

-- CreateIndex
CREATE INDEX "Intake_readinessStatus_idx" ON "Intake"("readinessStatus");

-- AddForeignKey
ALTER TABLE "QuestionnaireDefinition" ADD CONSTRAINT "QuestionnaireDefinition_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceTypeDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTypeDefinition" ADD CONSTRAINT "ServiceTypeDefinition_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intake" ADD CONSTRAINT "Intake_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intake" ADD CONSTRAINT "Intake_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceTypeDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeAnswerRevision" ADD CONSTRAINT "IntakeAnswerRevision_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "IntakeAnswer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveryMaterial" ADD CONSTRAINT "DiscoveryMaterial_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "Intake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveryMaterial" ADD CONSTRAINT "DiscoveryMaterial_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveryClarification" ADD CONSTRAINT "DiscoveryClarification_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "Intake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveryRisk" ADD CONSTRAINT "DiscoveryRisk_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "Intake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveryOutput" ADD CONSTRAINT "DiscoveryOutput_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "Intake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveryImpact" ADD CONSTRAINT "DiscoveryImpact_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "Intake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveryCollaborator" ADD CONSTRAINT "DiscoveryCollaborator_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "Intake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveryConfirmation" ADD CONSTRAINT "DiscoveryConfirmation_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "Intake"("id") ON DELETE CASCADE ON UPDATE CASCADE;
