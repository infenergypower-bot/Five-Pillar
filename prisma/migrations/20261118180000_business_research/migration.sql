CREATE TYPE "ResearchRunStage" AS ENUM ('PROFILE', 'GROWTH');
CREATE TYPE "ResearchRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'READY', 'PARTIAL', 'FAILED');

CREATE TABLE "BusinessResearchProfile" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT,
    "businessName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "website" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "profileData" JSONB NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BusinessResearchProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BusinessResearchRun" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "profileVersion" INTEGER NOT NULL,
    "stage" "ResearchRunStage" NOT NULL,
    "status" "ResearchRunStatus" NOT NULL DEFAULT 'QUEUED',
    "tasks" JSONB NOT NULL,
    "result" JSONB,
    "error" TEXT,
    "leaseUntil" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BusinessResearchRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BusinessResearchProfile_organizationId_updatedAt_idx" ON "BusinessResearchProfile"("organizationId", "updatedAt");
CREATE INDEX "BusinessResearchProfile_clientId_idx" ON "BusinessResearchProfile"("clientId");
CREATE INDEX "BusinessResearchRun_profileId_createdAt_idx" ON "BusinessResearchRun"("profileId", "createdAt");
CREATE INDEX "BusinessResearchRun_status_updatedAt_idx" ON "BusinessResearchRun"("status", "updatedAt");
CREATE UNIQUE INDEX "BusinessResearchRun_active_profile_stage_key" ON "BusinessResearchRun"("profileId", "stage") WHERE "status" IN ('QUEUED', 'RUNNING');

ALTER TABLE "BusinessResearchProfile" ADD CONSTRAINT "BusinessResearchProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BusinessResearchProfile" ADD CONSTRAINT "BusinessResearchProfile_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BusinessResearchRun" ADD CONSTRAINT "BusinessResearchRun_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "BusinessResearchProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

