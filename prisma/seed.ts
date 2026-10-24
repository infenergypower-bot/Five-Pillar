import {
  AllocationMethod,
  ApprovalStatus,
  ApprovalType,
  AssetStatus,
  BillingPeriod,
  ContractStatus,
  DeliveryStatus,
  FinancingStatus,
  GenerationStatus,
  IntakeStatus,
  InvoiceStatus,
  IPFormat,
  LedgerEntryType,
  OutboxStatus,
  PaymentStatus,
  PrismaClient,
  ProjectStatus,
  ProposalStatus,
  QuestionType,
  QuoteStatus,
  RecoupmentBasis,
  RecordStatus,
  RightsStatus,
  Role,
  ServicePath,
  WorkStatus,
} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();
const now = new Date("2026-01-01T12:00:00.000Z");
const monthEnd = new Date("2026-01-31T23:59:59.000Z");

async function main() {
  const organization = await prisma.organization.upsert({
    where: { slug: "five-pillar" },
    update: { minimumMargin: "0.50", targetMargin: "0.55", premiumMargin: "0.60" },
    create: {
      id: "seed-org-five-pillar",
      name: "Five Pillar Tech Ventures",
      slug: "five-pillar",
      minimumMargin: "0.50",
      targetMargin: "0.55",
      premiumMargin: "0.60",
    },
  });

  const founder = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: organization.id, email: "founder@fivepillar.local" } },
    update: { active: true, mfaRequired: false },
    create: {
      id: "seed-user-founder",
      organizationId: organization.id,
      email: "founder@fivepillar.local",
      name: "Founder",
      role: Role.SUPER_ADMIN,
      passwordHash: await hash("ChangeMeImmediately!", 12),
      mfaRequired: false,
    },
  });

  const permissions = [
    "clients.read", "clients.write", "costs.read", "costs.write", "quotes.approve",
    "margin.override", "projects.write", "finance.write", "ip.write", "integrations.write",
  ];
  const persistedPermissions = new Map<string, string>();
  for (const key of permissions) {
    const permission = await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { id: `seed-permission-${key}`, key, description: `Seed permission: ${key}` },
    });
    persistedPermissions.set(key, permission.id);
  }
  const founderRole = await prisma.accessRole.upsert({
    where: { organizationId_name: { organizationId: organization.id, name: "Founder" } },
    update: {},
    create: {
      id: "seed-role-founder",
      organizationId: organization.id,
      name: "Founder",
      systemKey: Role.SUPER_ADMIN,
      description: "Full organization access",
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: founder.id, roleId: founderRole.id } },
    update: {},
    create: { userId: founder.id, roleId: founderRole.id },
  });
  for (const key of permissions) {
    const permissionId = persistedPermissions.get(key);
    if (!permissionId) throw new Error(`Permission ${key} was not persisted`);
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: founderRole.id, permissionId } },
      update: {},
      create: { roleId: founderRole.id, permissionId },
    });
  }

  const laborNames = [
    "Founder", "Creative Director", "Producer", "Writer", "Researcher", "Storyboard Artist",
    "Prompt Engineer", "AI Video Production Specialist", "Animator", "Editor", "Sound Designer",
    "Voice Director", "Project Manager", "Account Manager", "Quality Assurance",
    "Finance / Administration", "Contractor",
  ];
  for (const [index, name] of laborNames.entries()) {
    const laborRole = await prisma.laborRole.upsert({
      where: { organizationId_name: { organizationId: organization.id, name } },
      update: { active: true },
      create: { id: `seed-labor-${index + 1}`, organizationId: organization.id, name },
    });
    await prisma.laborRate.upsert({
      where: { id: `seed-rate-${index + 1}` },
      update: {},
      create: {
        id: `seed-rate-${index + 1}`,
        laborRoleId: laborRole.id,
        hourlyCost: name === "Founder" ? 75 : 50,
        loadedHourlyCost: name === "Founder" ? 75 : 60,
        effectiveFrom: now,
      },
    });
  }

  await prisma.marginSetting.upsert({
    where: { id: "seed-margin-default" },
    update: {},
    create: {
      id: "seed-margin-default",
      organizationId: organization.id,
      minimumMargin: "0.50",
      targetMargin: "0.55",
      premiumMargin: "0.60",
      effectiveFrom: now,
    },
  });
  await prisma.overheadRule.upsert({
    where: { id: "seed-overhead-corporate" },
    update: {},
    create: {
      id: "seed-overhead-corporate",
      organizationId: organization.id,
      name: "Transparent shared corporate overhead",
      allocationMethod: AllocationMethod.WEIGHTED,
      rate: "0.10",
      servicePaths: Object.values(ServicePath),
      excludesStandaloneHosting: true,
      configuration: { note: "Alphi hosting is allocated only when actually used." },
    },
  });

  const packageData = [
    ["Motion", ServicePath.VISUAL_PRODUCTION, 299, 120],
    ["Spotlight", ServicePath.VISUAL_PRODUCTION, 599, 260],
    ["Product Story", ServicePath.VISUAL_PRODUCTION, 999, 440],
    ["Brand Commercial", ServicePath.VISUAL_PRODUCTION, 1795, 800],
    ["Cinema", ServicePath.VISUAL_PRODUCTION, 2995, 1347],
    ["Signature", ServicePath.VISUAL_PRODUCTION, 4995, 2247],
    ...Array.from({ length: 6 }, (_, i) => [`Managed Marketing Level ${i + 1}`, ServicePath.MANAGED_MARKETING, 1000 + i * 750, 450 + i * 325] as const),
    ["Managed Marketing Build-Your-Own", ServicePath.MANAGED_MARKETING, 0, 0] as const,
  ] as const;
  for (const [name, servicePath, startingPrice, ceiling] of packageData) {
    await prisma.servicePackage.upsert({
      where: { organizationId_name: { organizationId: organization.id, name } },
      update: {},
      create: {
        id: `seed-package-${name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`,
        organizationId: organization.id,
        name,
        servicePath,
        startingPrice,
        scope: { provisional: true, configurable: true, founderContributionIncluded: servicePath === ServicePath.MANAGED_MARKETING },
        limits: { reviewRounds: 2, requiresCostValidation: true },
        internalCostCeiling: ceiling || null,
        exclusions: { unrestrictedNarrativeProduction: true, adSpend: servicePath === ServicePath.MANAGED_MARKETING },
      },
    });
  }

  const openArt = await prisma.subscription.upsert({
    where: { organizationId_provider_name: { organizationId: organization.id, provider: "OpenArt", name: "Wonder" } },
    update: {},
    create: {
      id: "seed-sub-openart",
      organizationId: organization.id,
      provider: "OpenArt",
      name: "Wonder",
      billingPeriod: BillingPeriod.MONTHLY,
      amount: 240,
      division: "Studios",
      pricingType: "FIXED_WITH_CREDITS",
      allocationMethod: AllocationMethod.ACTUAL_USAGE,
      includedCredits: 106000,
      effectiveFrom: now,
      expenseCategory: "AI production",
      configuration: { provisional: true, verifyAfterPurchase: true },
    },
  });
  const alphi = await prisma.subscription.upsert({
    where: { organizationId_provider_name: { organizationId: organization.id, provider: "Railway", name: "Alphi AI Infrastructure" } },
    update: {},
    create: {
      id: "seed-sub-alphi",
      organizationId: organization.id,
      provider: "Railway",
      name: "Alphi AI Infrastructure",
      billingPeriod: BillingPeriod.USAGE,
      amount: 100,
      division: "Creative Agency",
      pricingType: "METERED",
      allocationMethod: AllocationMethod.ACTUAL_USAGE,
      effectiveFrom: now,
      expenseCategory: "Managed marketing infrastructure",
    },
  });
  const modelRate = await prisma.modelRate.upsert({
    where: { id: "seed-model-rate-openart" },
    update: {},
    create: {
      id: "seed-model-rate-openart",
      organizationId: organization.id,
      provider: "OpenArt",
      model: "Configurable video model",
      version: "provisional",
      resolution: "1080p",
      durationSeconds: 5,
      creditsPerGeneration: 1200,
      referenceImageCredits: 100,
      upscaleCredits: 200,
      effectiveFrom: now,
      additionalFeatureCosts: { permanentRate: false },
    },
  });
  await prisma.creditLedgerEntry.upsert({
    where: { id: "seed-credit-allowance" },
    update: {},
    create: {
      id: "seed-credit-allowance",
      subscriptionId: openArt.id,
      type: LedgerEntryType.ALLOWANCE,
      credits: 106000,
      periodStart: now,
      periodEnd: monthEnd,
      note: "Monthly included allowance; monetary amount intentionally omitted to prevent double-counting.",
    },
  });

  const questionnaire = await prisma.questionnaireDefinition.upsert({
    where: { organizationId_key: { organizationId: organization.id, key: "master-discovery" } },
    update: { status: RecordStatus.ACTIVE },
    create: {
      id: "seed-questionnaire-master",
      organizationId: organization.id,
      key: "master-discovery",
      name: "Master conditional discovery",
      status: RecordStatus.ACTIVE,
    },
  });
  const questionnaireVersion = await prisma.questionnaireVersion.upsert({
    where: { definitionId_version: { definitionId: questionnaire.id, version: 1 } },
    update: {},
    create: {
      id: "seed-questionnaire-v1",
      definitionId: questionnaire.id,
      version: 1,
      title: "Business, brand, production, marketing, and original IP discovery",
      publishedAt: now,
    },
  });
  const section = await prisma.questionnaireSection.upsert({
    where: { versionId_key: { versionId: questionnaireVersion.id, key: "core" } },
    update: {},
    create: { id: "seed-section-core", versionId: questionnaireVersion.id, key: "core", title: "Core discovery", sortOrder: 1 },
  });
  const questions = [
    ["service_path", "Which service path do you need?", QuestionType.MULTI_SELECT, true],
    ["objective", "What business problem should this engagement solve?", QuestionType.LONG_TEXT, true],
    ["deadline", "Is there a fixed launch date?", QuestionType.DATE, false],
    ["production_style", "Describe the desired production style.", QuestionType.LONG_TEXT, false],
    ["marketing_channels", "Which marketing channels should Five Pillar manage?", QuestionType.MULTI_SELECT, false],
  ] as const;
  for (const [key, label, type, required] of questions) {
    await prisma.questionDefinition.upsert({
      where: { sectionId_key: { sectionId: section.id, key } },
      update: {},
      create: {
        id: `seed-question-${key}`,
        sectionId: section.id,
        key,
        label,
        type,
        required,
        recommended: !required,
        sortOrder: questions.findIndex((q) => q[0] === key) + 1,
      },
    });
  }
  await prisma.questionCondition.upsert({
    where: { id: "seed-condition-production-style" },
    update: {},
    create: {
      id: "seed-condition-production-style",
      questionId: "seed-question-production_style",
      sourceQuestionId: "seed-question-service_path",
      operator: "CONTAINS",
      expectedValue: ServicePath.VISUAL_PRODUCTION,
    },
  });

  const createClient = async (id: string, displayName: string) =>
    prisma.client.upsert({
      where: { id },
      update: {},
      create: { id, organizationId: organization.id, legalName: `${displayName} LLC`, displayName },
    });
  const createIntake = async (id: string, clientId: string, path: ServicePath, completeness: number) =>
    prisma.intake.upsert({
      where: { id },
      update: { completeness },
      create: {
        id,
        clientId,
        questionnaireVersionId: questionnaireVersion.id,
        servicePath: path,
        status: IntakeStatus.COMPLETE,
        completeness,
        readiness: { concept: true, preliminaryEstimate: true, fixedQuote: completeness >= 90 },
        submittedAt: now,
      },
    });
  const createQuote = async (
    id: string,
    clientId: string,
    title: string,
    path: ServicePath,
    cost: number,
    price: number,
    status: QuoteStatus,
  ) => {
    const quote = await prisma.quote.upsert({
      where: { id },
      update: { clientId, projectTitle: title, servicePath: path, status },
      create: { id, organizationId: organization.id, clientId, projectTitle: title, servicePath: path, status, acceptedAt: status === QuoteStatus.ACCEPTED ? now : null },
    });
    const margin = (price - cost) / price;
    await prisma.quoteVersion.upsert({
      where: { quoteId_version: { quoteId: quote.id, version: 1 } },
      update: {},
      create: {
        id: `${id}-v1`,
        quoteId: quote.id,
        version: 1,
        status,
        laborSubtotal: cost * 0.65,
        nonLaborSubtotal: cost * 0.2,
        overhead: cost * 0.1,
        contingency: cost * 0.05,
        allInCost: cost,
        subtotal: price,
        finalPrice: price,
        targetMargin: "0.55",
        operatingProfit: price - cost,
        operatingMargin: margin,
        minimumPrice: cost / 0.5,
        recommendedPrice: cost / 0.45,
        premiumPrice: cost / 0.4,
        approvedAt: status === QuoteStatus.ACCEPTED ? now : null,
      },
    });
    return quote;
  };

  // Scenario A: accepted 30-second commercial through production, approval, delivery, and paid closeout.
  const commercialClient = await createClient("seed-client-commercial", "Atlas Outdoor");
  await prisma.brand.upsert({
    where: { id: "seed-brand-atlas" },
    update: {},
    create: { id: "seed-brand-atlas", organizationId: organization.id, clientId: commercialClient.id, name: "Atlas", profile: { style: "cinematic, aspirational" } },
  });
  await prisma.product.upsert({
    where: { id: "seed-product-atlas-bottle" },
    update: {},
    create: { id: "seed-product-atlas-bottle", organizationId: organization.id, clientId: commercialClient.id, brandId: "seed-brand-atlas", name: "Summit Bottle", sku: "ATLAS-SUMMIT" },
  });
  const commercialIntake = await createIntake("seed-intake-commercial", commercialClient.id, ServicePath.VISUAL_PRODUCTION, 100);
  for (const [questionId, value] of [
    ["seed-question-service_path", [ServicePath.VISUAL_PRODUCTION]],
    ["seed-question-objective", "Launch a 30-second product commercial."],
    ["seed-question-deadline", "2026-02-28"],
    ["seed-question-production_style", "Cinematic mountain sunrise with precise product detail."],
  ] as const) {
    await prisma.intakeAnswer.upsert({
      where: { intakeId_questionId: { intakeId: commercialIntake.id, questionId } },
      update: { value },
      create: { intakeId: commercialIntake.id, questionId, value, isDraft: false, answeredById: founder.id },
    });
  }
  await prisma.productionBrief.upsert({
    where: { id: "seed-brief-commercial" },
    update: {},
    create: {
      id: "seed-brief-commercial",
      intakeId: commercialIntake.id,
      title: "Summit Bottle 30-second commercial",
      objectives: { launch: true, callToAction: "Shop now" },
      creativeDirection: { style: "cinematic" },
      productionRequirements: { durationSeconds: 30, aspectRatios: ["16:9", "9:16"] },
      sourceMaterials: { logo: true, productPhoto: true },
      rightsRequirements: { paidAdvertising: true, territories: ["US"] },
      approvedAt: now,
    },
  });
  const commercialQuote = await createQuote("seed-quote-commercial", commercialClient.id, "Summit Bottle Commercial", ServicePath.VISUAL_PRODUCTION, 1347.75, 2995, QuoteStatus.ACCEPTED);
  await prisma.quoteLine.upsert({
    where: { id: "seed-line-commercial-production" },
    update: {},
    create: { id: "seed-line-commercial-production", quoteVersionId: `${commercialQuote.id}-v1`, category: "PRODUCTION", description: "30-second cinematic production", quantity: 1, unitCost: 1347.75, clientUnitPrice: 2995, internalOnly: false },
  });
  const commercialProposal = await prisma.proposal.upsert({
    where: { id: "seed-proposal-commercial" },
    update: {},
    create: { id: "seed-proposal-commercial", organizationId: organization.id, clientId: commercialClient.id, quoteId: commercialQuote.id, status: ProposalStatus.ACCEPTED, expiresAt: new Date("2026-02-01") },
  });
  await prisma.proposalVersion.upsert({
    where: { proposalId_version: { proposalId: commercialProposal.id, version: 1 } },
    update: {},
    create: { proposalId: commercialProposal.id, version: 1, templateKey: "visual-production", sections: { scope: true, timeline: true, rights: true, paymentSchedule: ["50%", "25%", "25%"] } },
  });
  const commercialProject = await prisma.project.upsert({
    where: { quoteId: commercialQuote.id },
    update: {},
    create: { id: "seed-project-commercial", organizationId: organization.id, clientId: commercialClient.id, quoteId: commercialQuote.id, title: "Summit Bottle Commercial", servicePath: ServicePath.VISUAL_PRODUCTION, status: ProjectStatus.COMPLETED, budget: 1347.75, actualCost: 1290 },
  });
  const commercialContract = await prisma.contract.upsert({
    where: { organizationId_number: { organizationId: organization.id, number: "FP-2026-001" } },
    update: {},
    create: { id: "seed-contract-commercial", organizationId: organization.id, clientId: commercialClient.id, proposalId: commercialProposal.id, projectId: commercialProject.id, number: "FP-2026-001", title: "Summit Bottle SOW", status: ContractStatus.SIGNED, signedAt: now, signatureProvider: null },
  });
  for (const [index, label, percentage, trigger] of [
    [1, "Deposit", "0.50", "CONTRACT_SIGNED"],
    [2, "Production milestone", "0.25", "STORYBOARD_APPROVED"],
    [3, "Final balance", "0.25", "BEFORE_FINAL_DELIVERY"],
  ] as const) {
    await prisma.paymentSchedule.upsert({
      where: { id: `seed-schedule-commercial-${index}` },
      update: {},
      create: { id: `seed-schedule-commercial-${index}`, contractId: commercialContract.id, label, percentage, dueTrigger: trigger, sortOrder: index },
    });
  }
  for (const [id, name, order] of [["concept", "Concept", 1], ["production", "Production", 2], ["delivery", "Delivery", 3]] as const) {
    await prisma.milestone.upsert({
      where: { id: `seed-milestone-commercial-${id}` },
      update: {},
      create: { id: `seed-milestone-commercial-${id}`, projectId: commercialProject.id, name, sortOrder: order, status: WorkStatus.DONE, completedAt: now },
    });
  }
  await prisma.task.upsert({
    where: { id: "seed-task-commercial-master" },
    update: {},
    create: { id: "seed-task-commercial-master", projectId: commercialProject.id, assigneeId: founder.id, title: "Master and quality-control final exports", status: WorkStatus.DONE, actualHours: 4, completedAt: now },
  });
  for (const [index, type] of [ApprovalType.CONCEPT, ApprovalType.SCRIPT, ApprovalType.STORYBOARD, ApprovalType.FINAL_CUT, ApprovalType.FINAL_DELIVERY].entries()) {
    await prisma.approval.upsert({
      where: { id: `seed-approval-commercial-${index}` },
      update: {},
      create: { id: `seed-approval-commercial-${index}`, projectId: commercialProject.id, type, status: ApprovalStatus.APPROVED, decidedById: founder.id, decidedAt: now },
    });
  }
  const finalAsset = await prisma.asset.upsert({
    where: { id: "seed-asset-commercial-master" },
    update: {},
    create: { id: "seed-asset-commercial-master", projectId: commercialProject.id, clientId: commercialClient.id, ownerOrganizationId: organization.id, category: "FINAL_DELIVERABLE", name: "Summit Bottle Master", storageKey: "seed/commercial/master.mp4", mimeType: "video/mp4", sizeBytes: 1, status: AssetStatus.AVAILABLE, approvalStatus: ApprovalStatus.APPROVED },
  });
  await prisma.deliverable.upsert({
    where: { id: "seed-deliverable-commercial-master" },
    update: {},
    create: { id: "seed-deliverable-commercial-master", projectId: commercialProject.id, assetId: finalAsset.id, name: "30-second master", format: "MP4", aspectRatio: "16:9", resolution: "1080p", status: DeliveryStatus.ACCEPTED, releasedAt: now, acceptedAt: now, releaseCondition: { finalInvoicePaid: true } },
  });
  const commercialInvoice = await prisma.invoice.upsert({
    where: { organizationId_number: { organizationId: organization.id, number: "INV-2026-001" } },
    update: {},
    create: { id: "seed-invoice-commercial", organizationId: organization.id, clientId: commercialClient.id, projectId: commercialProject.id, number: "INV-2026-001", status: InvoiceStatus.PAID, subtotal: 2995, total: 2995, amountPaid: 2995, dueAt: now, paidAt: now },
  });
  await prisma.payment.upsert({
    where: { idempotencyKey: "seed-payment-commercial" },
    update: {},
    create: { organizationId: organization.id, invoiceId: commercialInvoice.id, idempotencyKey: "seed-payment-commercial", amount: 2995, status: PaymentStatus.SUCCEEDED, provider: "DEMO_CONFIRMED", receivedAt: now },
  });

  // Scenario B: managed marketing onboarding with founder labor and attributable Alphi infrastructure.
  const marketingClient = await createClient("seed-client-marketing", "Harbor Health");
  await createIntake("seed-intake-marketing", marketingClient.id, ServicePath.MANAGED_MARKETING, 94);
  await prisma.serviceSubscription.upsert({
    where: { id: "seed-service-sub-marketing" },
    update: {},
    create: { id: "seed-service-sub-marketing", clientId: marketingClient.id, subscriptionId: alphi.id, packageName: "Managed Marketing Level 3", serviceLevel: 3, onboardingFee: 750, monthlyFee: 2500, minimumTermMonths: 3, startsAt: now, deliverables: { channels: ["Instagram", "LinkedIn"], reporting: "monthly", approvalRequired: true }, founderHours: 4 },
  });
  const marketingQuote = await createQuote("seed-quote-marketing", marketingClient.id, "Managed Marketing Onboarding", ServicePath.MANAGED_MARKETING, 1450, 3250, QuoteStatus.ACCEPTED);
  await prisma.proposal.upsert({
    where: { id: "seed-proposal-marketing" },
    update: {},
    create: { id: "seed-proposal-marketing", organizationId: organization.id, clientId: marketingClient.id, quoteId: marketingQuote.id, status: ProposalStatus.ACCEPTED },
  });
  const marketingProject = await prisma.project.upsert({
    where: { quoteId: marketingQuote.id },
    update: {},
    create: { id: "seed-project-marketing", organizationId: organization.id, clientId: marketingClient.id, quoteId: marketingQuote.id, title: "Harbor Health Managed Marketing", servicePath: ServicePath.MANAGED_MARKETING, status: ProjectStatus.AWAITING_ASSETS, budget: 1450 },
  });
  await prisma.subscriptionAllocation.upsert({
    where: { subscriptionId_projectId_periodStart: { subscriptionId: alphi.id, projectId: marketingProject.id, periodStart: now } },
    update: {},
    create: { subscriptionId: alphi.id, projectId: marketingProject.id, periodStart: now, periodEnd: monthEnd, method: AllocationMethod.ACTUAL_USAGE, allocatedAmount: 65, rationale: "Attributable managed-service infrastructure only." },
  });

  // Scenario C: hybrid proposal keeps studio production and recurring managed services separate.
  const hybridClient = await createClient("seed-client-hybrid", "Northstar Foods");
  const hybridQuote = await createQuote("seed-quote-hybrid", hybridClient.id, "Launch Commercial + Managed Campaign", ServicePath.COMBINED, 3600, 8000, QuoteStatus.ACCEPTED);
  for (const line of [
    { id: "seed-line-hybrid-studio", category: "STUDIO", description: "Original launch commercial", cost: 2200, price: 4995, path: ServicePath.VISUAL_PRODUCTION },
    { id: "seed-line-hybrid-agency", category: "AGENCY", description: "Monthly managed marketing", cost: 1400, price: 3005, path: ServicePath.MANAGED_MARKETING },
  ]) {
    await prisma.quoteLine.upsert({
      where: { id: line.id },
      update: {},
      create: { id: line.id, quoteVersionId: `${hybridQuote.id}-v1`, category: line.category, description: line.description, quantity: 1, unitCost: line.cost, clientUnitPrice: line.price, internalOnly: false, servicePath: line.path },
    });
  }
  await prisma.proposal.upsert({
    where: { id: "seed-proposal-hybrid" },
    update: {},
    create: { id: "seed-proposal-hybrid", organizationId: organization.id, clientId: hybridClient.id, quoteId: hybridQuote.id, status: ProposalStatus.ACCEPTED },
  });
  const hybridProject = await prisma.project.upsert({
    where: { quoteId: hybridQuote.id },
    update: {},
    create: { id: "seed-project-hybrid", organizationId: organization.id, clientId: hybridClient.id, quoteId: hybridQuote.id, title: "Northstar Launch", servicePath: ServicePath.COMBINED, status: ProjectStatus.PRODUCTION_READY, budget: 3600 },
  });
  const alphiConnection = await prisma.integrationConnection.upsert({
    where: { organizationId_provider_name: { organizationId: organization.id, provider: "Alphi AI", name: "Pending adapter" } },
    update: {},
    create: { id: "seed-connection-alphi", organizationId: organization.id, provider: "Alphi AI", name: "Pending adapter", status: RecordStatus.DRAFT, configuration: { externalSuccess: false, autoPublish: false } },
  });
  await prisma.integrationOutboxEvent.upsert({
    where: { idempotencyKey: "seed-hybrid-approved-asset" },
    update: {},
    create: { connectionId: alphiConnection.id, organizationId: organization.id, eventType: "CAMPAIGN_ASSETS_APPROVED", aggregateType: "Project", aggregateId: hybridProject.id, idempotencyKey: "seed-hybrid-approved-asset", payload: { publishingAuthorized: false }, status: OutboxStatus.PENDING, lastError: "Adapter intentionally unconfigured in development seed." },
  });

  // Scenario D: internally funded original short with rights, plan, costs, and speculative recoupment.
  const originalTitle = await prisma.originalTitle.upsert({
    where: { organizationId_workingTitle: { organizationId: organization.id, workingTitle: "The Fifth Light" } },
    update: {},
    create: { id: "seed-ip-fifth-light", organizationId: organization.id, workingTitle: "The Fifth Light", format: IPFormat.SHORT_FILM, genre: "Science fiction", logline: "A failing beacon forces its keeper to choose between duty and discovery.", synopsis: "Internal proof-of-concept short.", runtimeMinutes: 12, rightsStatus: RightsStatus.CLEARED, developmentBudget: 5000, productionBudget: 18000, releaseBudget: 3000 },
  });
  await prisma.rightsRecord.upsert({
    where: { id: "seed-rights-fifth-light" },
    update: {},
    create: { id: "seed-rights-fifth-light", originalTitleId: originalTitle.id, rightType: "COPYRIGHT_AND_DERIVATIVES", ownerName: "Five Pillar Tech Ventures", ownershipPercent: 1, status: RightsStatus.CLEARED, territories: ["WORLDWIDE"], media: ["ALL_MEDIA"], exclusive: true },
  });
  const originalProject = await prisma.project.upsert({
    where: { id: "seed-project-original" },
    update: {},
    create: { id: "seed-project-original", organizationId: organization.id, originalTitleId: originalTitle.id, title: "The Fifth Light — Proof of Concept", servicePath: ServicePath.ORIGINAL_ENTERTAINMENT, status: ProjectStatus.STORYBOARDING, budget: 18000 },
  });
  const bible = await prisma.productionBible.upsert({
    where: { id: "seed-bible-original" },
    update: {},
    create: { id: "seed-bible-original", projectId: originalProject.id, title: "The Fifth Light Production Bible" },
  });
  await prisma.productionBibleVersion.upsert({
    where: { bibleId_version: { bibleId: bible.id, version: 1 } },
    update: {},
    create: { bibleId: bible.id, version: 1, premise: "Hope persists after systems fail.", visualStyle: { palette: "deep indigo and amber" }, characters: { keeper: "Mara" }, environments: { beacon: "orbital navigation station" }, productionRules: { continuityLocked: true } },
  });
  const scene = await prisma.scene.upsert({
    where: { projectId_sceneNumber: { projectId: originalProject.id, sceneNumber: "1" } },
    update: {},
    create: { id: "seed-scene-original-1", projectId: originalProject.id, sceneNumber: "1", title: "Beacon Failure", description: "Mara discovers the beacon anomaly.", location: "Orbital beacon", timeOfDay: "Artificial night", sortOrder: 1 },
  });
  const shot = await prisma.shot.upsert({
    where: { sceneId_shotCode: { sceneId: scene.id, shotCode: "1A" } },
    update: {},
    create: { id: "seed-shot-original-1a", sceneId: scene.id, shotCode: "1A", description: "Wide reveal of the failing beacon.", intendedDurationSeconds: 5, camera: { angle: "wide", movement: "slow push" }, lighting: "emergency amber", environment: "orbital exterior", expectedCredits: 3600, status: WorkStatus.IN_PROGRESS, sortOrder: 1 },
  });
  const generation = await prisma.generationEvent.upsert({
    where: { id: "seed-generation-original-1" },
    update: {},
    create: { id: "seed-generation-original-1", projectId: originalProject.id, shotId: shot.id, modelRateId: modelRate.id, attemptNumber: 1, status: GenerationStatus.REJECTED, expectedCredits: 1200, actualCredits: 1200, approved: false, parameters: { externalProviderSuccess: false }, completedAt: now },
  });
  await prisma.creditLedgerEntry.upsert({
    where: { id: "seed-credit-original-usage" },
    update: {},
    create: { id: "seed-credit-original-usage", subscriptionId: openArt.id, projectId: originalProject.id, generationEventId: generation.id, type: LedgerEntryType.USAGE, credits: -1200, periodStart: now, periodEnd: monthEnd, note: "Rejected attempt remains visible; no duplicate monetary charge." },
  });
  await prisma.financingSource.upsert({
    where: { id: "seed-financing-original" },
    update: {},
    create: { id: "seed-financing-original", originalTitleId: originalTitle.id, name: "Five Pillar internal development fund", type: "INTERNAL", status: FinancingStatus.COMMITTED, committedAmount: 26000, receivedAmount: 0, terms: { guaranteedRevenue: false } },
  });
  await prisma.distributionAssumption.upsert({
    where: { id: "seed-distribution-original" },
    update: {},
    create: { id: "seed-distribution-original", originalTitleId: originalTitle.id, channel: "Licensing / festivals", territory: "Worldwide", grossReceipts: 60000, distributionFeeRate: "0.20", distributionExpenses: 4000, netReceipts: 44000, probability: "0.25", notes: "Speculative; not guaranteed." },
  });
  await prisma.recoupmentTier.upsert({
    where: { originalTitleId_priority: { originalTitleId: originalTitle.id, priority: 1 } },
    update: {},
    create: { originalTitleId: originalTitle.id, priority: 1, participant: "Five Pillar internal fund", basis: RecoupmentBasis.NET_RECEIPTS, recoupableAmount: 26000, shareRate: 1 },
  });
  await prisma.financialProjection.upsert({
    where: { originalTitleId_scenario: { originalTitleId: originalTitle.id, scenario: "Base speculative" } },
    update: {},
    create: { originalTitleId: originalTitle.id, scenario: "Base speculative", productionCost: 23000, releaseCost: 3000, grossReceipts: 60000, distributionDeductions: 16000, netReceipts: 44000, recoupment: 26000, projectedProfit: 18000, breakEvenRevenue: 35000, revenueAt50Margin: 52000, revenueAt55Margin: 57777.78, revenueAt60Margin: 65000, speculative: true },
  });

  // Scenario E: the $2,995 quote is below the 50% floor after costs rise; no approval is recorded.
  const marginQuote = await createQuote("seed-quote-margin", hybridClient.id, "Cinema Package Cost Overrun", ServicePath.VISUAL_PRODUCTION, 1700, 2995, QuoteStatus.INTERNAL_REVIEW);
  await prisma.client.deleteMany({ where: { id: "seed-client-margin" } });
  await prisma.marginOverride.upsert({
    where: { id: "seed-margin-override-pending" },
    update: {},
    create: { id: "seed-margin-override-pending", quoteVersionId: `${marginQuote.id}-v1`, requestedById: founder.id, reason: "Cost increase reduced margin below the configured 50% minimum.", minimumMargin: "0.50", proposedMargin: (2995 - 1700) / 2995 },
  });
  await prisma.auditEvent.upsert({
    where: { id: "seed-audit-margin-blocked" },
    update: {},
    create: { id: "seed-audit-margin-blocked", organizationId: organization.id, actorId: founder.id, action: "QUOTE_APPROVAL_BLOCKED", entityType: "Quote", entityId: marginQuote.id, after: { allInCost: 1700, price: 2995, margin: 0.4324, minimumMargin: 0.5 }, reason: "Authorized exception required." },
  });

  await prisma.automationRule.upsert({
    where: { organizationId_name: { organizationId: organization.id, name: "Accepted quote creates project draft" } },
    update: {},
    create: { id: "seed-automation-quote-project", organizationId: organization.id, name: "Accepted quote creates project draft", triggerType: "QUOTE_ACCEPTED", conditions: { agreementAndDepositRequiredBeforeProduction: true }, actions: { createProject: true, createMilestones: true, recordAuditEvent: true }, requiresHumanApproval: false },
  });
  await prisma.backgroundJob.upsert({
    where: { dedupeKey: "seed-pending-alphi-dispatch" },
    update: {},
    create: { organizationId: organization.id, type: "INTEGRATION_OUTBOX_DISPATCH", dedupeKey: "seed-pending-alphi-dispatch", payload: { connectionId: alphiConnection.id }, status: "QUEUED", runAt: now },
  });
  await prisma.notification.upsert({
    where: { id: "seed-notification-margin" },
    update: {},
    create: { id: "seed-notification-margin", organizationId: organization.id, userId: founder.id, channel: "IN_APP", type: "MARGIN_ALERT", title: "Quote below minimum margin", body: "Cinema Package Cost Overrun requires an authorized exception.", entityType: "Quote", entityId: marginQuote.id },
  });
  await prisma.emailMessage.upsert({
    where: { id: "seed-email-pending" },
    update: {},
    create: { id: "seed-email-pending", organizationId: organization.id, toAddresses: ["client@example.invalid"], ccAddresses: [], subject: "Demo proposal ready", templateKey: "proposal-ready", status: OutboxStatus.PENDING, payload: { externalProviderSuccess: false } },
  });

  console.log("Seeded five complete data-foundation scenarios without claiming external provider success.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
