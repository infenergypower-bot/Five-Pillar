import {
  AllocationMethod,
  AnswerSource,
  ApprovalStatus,
  ApprovalType,
  AssetStatus,
  BillingPeriod,
  ContractStatus,
  DeliveryStatus,
  DiscoveryOutputType,
  DiscoveryReadinessStatus,
  FinancingStatus,
  GenerationStatus,
  IntakeStatus,
  InvoiceStatus,
  IPFormat,
  LedgerEntryType,
  LeadStage,
  OutboxStatus,
  PaymentStatus,
  Prisma,
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
  VerificationStatus,
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

  for (const serviceType of [
    { key: "visual-production", name: "Visual Production", configuration: { compatibilityPath: ServicePath.VISUAL_PRODUCTION, capabilities: ["commercial", "film", "animation", "product-visualization"] } },
    { key: "managed-marketing", name: "Managed Marketing", configuration: { compatibilityPath: ServicePath.MANAGED_MARKETING, capabilities: ["strategy", "content-plan", "campaign-operations", "alphi"] } },
    { key: "combined", name: "Combined Studio + Marketing", configuration: { compatibilityPath: ServicePath.COMBINED, capabilities: ["visual-production", "managed-marketing"] } },
    { key: "original-entertainment", name: "Original Entertainment", configuration: { compatibilityPath: ServicePath.ORIGINAL_ENTERTAINMENT, capabilities: ["story-development", "production", "distribution-readiness"] } },
  ]) {
    await prisma.serviceTypeDefinition.upsert({
      where: { organizationId_key: { organizationId: organization.id, key: serviceType.key } },
      update: { name: serviceType.name, configuration: serviceType.configuration, active: true },
      create: { organizationId: organization.id, ...serviceType },
    });
  }

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
  const discoverySections = [
    { key: "core", title: "Engagement starting point", description: "Define the requested service, objective, timing, and broad direction." },
    { key: "business", title: "Business discovery", description: "Establish the client profile and commercial context." },
    { key: "brand", title: "Brand intelligence", description: "Capture the voice, identity, positioning, and non-negotiables." },
    { key: "audience", title: "Audience research", description: "Define who must be reached and what should change." },
    { key: "marketing", title: "Marketing strategy", description: "Build the campaign, content, workflow, and Alphi profile." },
    { key: "production", title: "Visual production", description: "Specify scenes, characters, environments, sound, and product fidelity." },
    { key: "entertainment", title: "Original entertainment", description: "Capture story, screenplay, worldbuilding, financing, and distribution." },
    { key: "technical", title: "Technical deliverables", description: "Define formats, platforms, ratios, resolution, captions, and delivery." },
    { key: "budget", title: "Budget and schedule", description: "Confirm financial authority, range, deadlines, and estimating constraints." },
    { key: "approvals", title: "Approvals and collaboration", description: "Identify stakeholders, final authority, and revision expectations." },
    { key: "legal", title: "Legal, claims, and usage", description: "Verify ownership, permissions, licensing, territories, and claims." },
  ];
  const sectionIds = new Map<string, string>();
  for (const [index, definition] of discoverySections.entries()) {
    const section = await prisma.questionnaireSection.upsert({
      where: { versionId_key: { versionId: questionnaireVersion.id, key: definition.key } },
      update: { title: definition.title, description: definition.description, sortOrder: index + 1 },
      create: { id: `seed-section-${definition.key}`, versionId: questionnaireVersion.id, ...definition, sortOrder: index + 1 },
    });
    sectionIds.set(definition.key, section.id);
  }
  await prisma.questionCondition.deleteMany({ where: { id: "seed-condition-production-style" } });

  const discoveryQuestions = [
    { section: "core", key: "service_path", label: "Which service path do you need?", type: QuestionType.MULTI_SELECT, required: true, critical: true, category: "BUSINESS", destination: { target: "Intake.servicePath" }, options: [[ServicePath.VISUAL_PRODUCTION, "Visual production"], [ServicePath.MANAGED_MARKETING, "Managed marketing"], [ServicePath.COMBINED, "Combined"], [ServicePath.ORIGINAL_ENTERTAINMENT, "Original entertainment"], [ServicePath.CUSTOM, "Custom or unsure"]] },
    { section: "core", key: "objective", label: "What business or creative problem should this engagement solve?", type: QuestionType.LONG_TEXT, required: true, category: "BUSINESS", validation: { minLength: 20 }, destination: { target: "ProductionBrief.objectives", affectedAreas: ["DISCOVERY_BRIEF", "DELIVERABLES", "QUOTE"] } },
    { section: "core", key: "deadline", label: "What is the required delivery or launch date?", type: QuestionType.DATE, required: true, critical: true, category: "SCHEDULE", destination: { target: "Project.dueAt", affectedAreas: ["SCHEDULE", "QUOTE", "APPROVALS"] } },
    { section: "core", key: "production_style", label: "Describe the desired visual production style.", type: QuestionType.LONG_TEXT, category: "PRODUCTION", validation: { minLength: 20 }, destination: { target: "ProductionBrief.creativeDirection" }, condition: { sourceKey: "service_path", operator: "IN", expectedValue: [ServicePath.VISUAL_PRODUCTION, ServicePath.COMBINED, ServicePath.ORIGINAL_ENTERTAINMENT] } },
    { section: "core", key: "marketing_channels", label: "Which marketing channels should Pillar One manage?", type: QuestionType.MULTI_SELECT, category: "MARKETING", destination: { target: "MarketingProfile.channels" }, options: [["INSTAGRAM", "Instagram"], ["LINKEDIN", "LinkedIn"], ["FACEBOOK", "Facebook"], ["TIKTOK", "TikTok"], ["YOUTUBE", "YouTube"], ["EMAIL", "Email"]], condition: { sourceKey: "service_path", operator: "IN", expectedValue: [ServicePath.MANAGED_MARKETING, ServicePath.COMBINED] } },

    { section: "business", key: "business_name", label: "What is the legal or public business name?", type: QuestionType.SHORT_TEXT, required: true, category: "BUSINESS", reuseKey: "business_name", destination: { target: "Client.displayName" } },
    { section: "business", key: "business_model", label: "How does the business make money?", type: QuestionType.LONG_TEXT, required: true, category: "BUSINESS", reuseKey: "business_model", destination: { target: "Client.profile.businessModel" } },
    { section: "business", key: "industry", label: "Which industry and market category apply?", type: QuestionType.SHORT_TEXT, required: true, category: "BUSINESS", reuseKey: "industry", destination: { target: "Client.industry" } },
    { section: "business", key: "website", label: "What is the primary website or storefront?", type: QuestionType.URL, category: "BUSINESS", reuseKey: "website", destination: { target: "Client.website" } },
    { section: "business", key: "primary_objective", label: "What measurable outcome should this work achieve?", type: QuestionType.LONG_TEXT, required: true, category: "BUSINESS", validation: { minLength: 20 }, destination: { target: "ProductionBrief.objectives" } },

    { section: "brand", key: "brand_voice", label: "Describe the brand voice in three to five traits.", type: QuestionType.LONG_TEXT, required: true, category: "BRAND", reuseKey: "brand_voice", destination: { target: "Brand.profile.voice" } },
    { section: "brand", key: "brand_values", label: "Which values must every creative decision reinforce?", type: QuestionType.LONG_TEXT, category: "BRAND", reuseKey: "brand_values", destination: { target: "Brand.profile.values" } },
    { section: "brand", key: "visual_identity", label: "Describe the existing visual identity and mandatory brand elements.", type: QuestionType.LONG_TEXT, required: true, category: "BRAND", reuseKey: "visual_identity", destination: { target: "Brand.profile.visualIdentity" } },
    { section: "brand", key: "competitors", label: "Which competitors or alternatives should we understand?", type: QuestionType.LONG_TEXT, recommended: true, category: "BRAND", destination: { target: "Brand.profile.competitors" } },
    { section: "brand", key: "product_positioning", label: "What makes this offer meaningfully different?", type: QuestionType.LONG_TEXT, required: true, category: "BRAND", destination: { target: "Brand.profile.positioning" } },

    { section: "audience", key: "target_audience", label: "Who specifically must this work reach?", type: QuestionType.LONG_TEXT, required: true, category: "AUDIENCE", reuseKey: "target_audience", destination: { target: "Client.profile.targetAudience" } },
    { section: "audience", key: "audience_pain_points", label: "Which audience problems, objections, or desires matter most?", type: QuestionType.LONG_TEXT, required: true, category: "AUDIENCE", destination: { target: "Client.profile.audiencePainPoints" } },
    { section: "audience", key: "audience_action", label: "What should the audience think, feel, or do next?", type: QuestionType.LONG_TEXT, required: true, category: "AUDIENCE", destination: { target: "ProductionBrief.callToAction" } },
    { section: "audience", key: "audience_locations", label: "Where is the target audience located?", type: QuestionType.SHORT_TEXT, recommended: true, category: "AUDIENCE", destination: { target: "Client.profile.audienceLocations" } },

    { section: "marketing", key: "campaign_objectives", label: "What are the campaign objectives and success measures?", type: QuestionType.LONG_TEXT, required: true, category: "MARKETING", destination: { target: "MarketingProfile.objectives" }, condition: { sourceKey: "service_path", operator: "IN", expectedValue: [ServicePath.MANAGED_MARKETING, ServicePath.COMBINED] } },
    { section: "marketing", key: "content_volume", label: "How much content is required each month?", type: QuestionType.NUMBER, required: true, category: "MARKETING", destination: { target: "ServiceSubscription.deliverables" }, condition: { sourceKey: "service_path", operator: "IN", expectedValue: [ServicePath.MANAGED_MARKETING, ServicePath.COMBINED] } },
    { section: "marketing", key: "existing_marketing_data", label: "Which analytics, customer, and campaign data can be shared?", type: QuestionType.LONG_TEXT, recommended: true, category: "MARKETING", destination: { target: "MarketingProfile.dataSources" }, condition: { sourceKey: "service_path", operator: "IN", expectedValue: [ServicePath.MANAGED_MARKETING, ServicePath.COMBINED] } },
    { section: "marketing", key: "alphi_integration", label: "Should this profile feed Alphi AI campaign orchestration?", type: QuestionType.BOOLEAN, category: "MARKETING", destination: { target: "IntegrationOutbox.payload" }, condition: { sourceKey: "service_path", operator: "IN", expectedValue: [ServicePath.MANAGED_MARKETING, ServicePath.COMBINED] } },

    { section: "production", key: "scene_count", label: "How many scenes or major visual setups are expected?", type: QuestionType.NUMBER, required: true, category: "PRODUCTION", destination: { target: "Project.sceneEstimate", affectedAreas: ["DELIVERABLES", "SCHEDULE", "PRODUCTION_PLAN", "QUOTE"] }, condition: { sourceKey: "service_path", operator: "IN", expectedValue: [ServicePath.VISUAL_PRODUCTION, ServicePath.COMBINED, ServicePath.ORIGINAL_ENTERTAINMENT] } },
    { section: "production", key: "locations", label: "Describe every required location or environment.", type: QuestionType.LONG_TEXT, required: true, category: "PRODUCTION", destination: { target: "ProductionBrief.environments" }, condition: { sourceKey: "service_path", operator: "IN", expectedValue: [ServicePath.VISUAL_PRODUCTION, ServicePath.COMBINED, ServicePath.ORIGINAL_ENTERTAINMENT] } },
    { section: "production", key: "characters", label: "How many recurring characters, people, or creatures appear?", type: QuestionType.NUMBER, category: "PRODUCTION", destination: { target: "ProductionBrief.characters" }, condition: { sourceKey: "service_path", operator: "IN", expectedValue: [ServicePath.VISUAL_PRODUCTION, ServicePath.COMBINED, ServicePath.ORIGINAL_ENTERTAINMENT] } },
    { section: "production", key: "character_identity", label: "Define each character's identity, appearance, wardrobe, and continuity requirements.", type: QuestionType.LONG_TEXT, category: "PRODUCTION", destination: { target: "ProductionBible.characters" }, condition: { sourceKey: "characters", operator: "GREATER_THAN", expectedValue: 0 } },
    { section: "production", key: "dialogue", label: "Is scripted dialogue required?", type: QuestionType.BOOLEAN, category: "PRODUCTION", destination: { target: "ProductionBrief.scriptRequirements" }, condition: { sourceKey: "service_path", operator: "IN", expectedValue: [ServicePath.VISUAL_PRODUCTION, ServicePath.COMBINED, ServicePath.ORIGINAL_ENTERTAINMENT] } },
    { section: "production", key: "narrator_required", label: "Is a narrator or voice-over required?", type: QuestionType.BOOLEAN, category: "PRODUCTION", destination: { target: "ProductionBrief.voiceRequirements" }, condition: { sourceKey: "service_path", operator: "IN", expectedValue: [ServicePath.VISUAL_PRODUCTION, ServicePath.COMBINED, ServicePath.ORIGINAL_ENTERTAINMENT] } },
    { section: "production", key: "voice_direction", label: "Describe voice, tone, language, accent, and casting restrictions.", type: QuestionType.LONG_TEXT, category: "PRODUCTION", destination: { target: "ProductionBrief.voiceDirection" }, condition: { sourceKey: "narrator_required", operator: "IS_TRUE", expectedValue: true } },
    { section: "production", key: "props", label: "List important props and product handling requirements.", type: QuestionType.LONG_TEXT, category: "PRODUCTION", destination: { target: "ProductionBrief.props" }, condition: { sourceKey: "service_path", operator: "IN", expectedValue: [ServicePath.VISUAL_PRODUCTION, ServicePath.COMBINED, ServicePath.ORIGINAL_ENTERTAINMENT] } },
    { section: "production", key: "product_accuracy", label: "Which product details must be reproduced exactly?", type: QuestionType.LONG_TEXT, critical: true, category: "PRODUCTION", destination: { target: "ProductionBrief.productAccuracy" }, condition: { sourceKey: "service_path", operator: "IN", expectedValue: [ServicePath.VISUAL_PRODUCTION, ServicePath.COMBINED] } },
    { section: "production", key: "soundtrack", label: "Describe music, sound design, and licensing expectations.", type: QuestionType.LONG_TEXT, category: "PRODUCTION", destination: { target: "ProductionBrief.soundtrack" }, condition: { sourceKey: "service_path", operator: "IN", expectedValue: [ServicePath.VISUAL_PRODUCTION, ServicePath.COMBINED, ServicePath.ORIGINAL_ENTERTAINMENT] } },

    { section: "entertainment", key: "premise", label: "What is the story premise and logline?", type: QuestionType.LONG_TEXT, required: true, category: "ORIGINAL_IP", destination: { target: "OriginalTitle.logline" }, condition: { sourceKey: "service_path", operator: "CONTAINS", expectedValue: ServicePath.ORIGINAL_ENTERTAINMENT } },
    { section: "entertainment", key: "genre", label: "What genre, format, and intended rating apply?", type: QuestionType.SHORT_TEXT, required: true, category: "ORIGINAL_IP", destination: { target: "OriginalTitle.genre" }, condition: { sourceKey: "service_path", operator: "CONTAINS", expectedValue: ServicePath.ORIGINAL_ENTERTAINMENT } },
    { section: "entertainment", key: "screenplay_status", label: "What is the screenplay or treatment status?", type: QuestionType.SINGLE_SELECT, required: true, category: "ORIGINAL_IP", destination: { target: "OriginalTitle.developmentStatus" }, options: [["IDEA", "Idea only"], ["TREATMENT", "Treatment"], ["DRAFT", "Draft screenplay"], ["LOCKED", "Locked screenplay"]], condition: { sourceKey: "service_path", operator: "CONTAINS", expectedValue: ServicePath.ORIGINAL_ENTERTAINMENT } },
    { section: "entertainment", key: "worldbuilding", label: "Describe the world, rules, history, and recurring environments.", type: QuestionType.LONG_TEXT, required: true, category: "ORIGINAL_IP", destination: { target: "ProductionBible.worldRules" }, condition: { sourceKey: "service_path", operator: "CONTAINS", expectedValue: ServicePath.ORIGINAL_ENTERTAINMENT } },
    { section: "entertainment", key: "production_complexity", label: "What production complexity or technical challenges are anticipated?", type: QuestionType.LONG_TEXT, required: true, category: "ORIGINAL_IP", destination: { target: "Project.productionPlan" }, condition: { sourceKey: "service_path", operator: "CONTAINS", expectedValue: ServicePath.ORIGINAL_ENTERTAINMENT } },
    { section: "entertainment", key: "intended_distribution", label: "What distribution path and audience are intended?", type: QuestionType.LONG_TEXT, required: true, category: "ORIGINAL_IP", destination: { target: "OriginalTitle.distributionStrategy" }, condition: { sourceKey: "service_path", operator: "CONTAINS", expectedValue: ServicePath.ORIGINAL_ENTERTAINMENT } },
    { section: "entertainment", key: "financing", label: "What financing is committed, conditional, or still required?", type: QuestionType.LONG_TEXT, critical: true, category: "FINANCIAL", destination: { target: "OriginalTitle.financingStatus" }, condition: { sourceKey: "service_path", operator: "CONTAINS", expectedValue: ServicePath.ORIGINAL_ENTERTAINMENT } },

    { section: "technical", key: "deliverables", label: "List every required final deliverable.", type: QuestionType.LONG_TEXT, required: true, critical: true, category: "DELIVERABLES", destination: { target: "Project.deliverables", affectedAreas: ["DELIVERABLES", "SCHEDULE", "QUOTE"] } },
    { section: "technical", key: "platforms", label: "Which platforms or destinations will receive the work?", type: QuestionType.MULTI_SELECT, required: true, category: "DELIVERABLES", destination: { target: "Project.platforms" }, options: [["WEB", "Website"], ["SOCIAL", "Social media"], ["BROADCAST", "Broadcast"], ["STREAMING", "Streaming"], ["THEATRICAL", "Theatrical"], ["INTERNAL", "Internal use"]] },
    { section: "technical", key: "aspect_ratios", label: "Which aspect ratios are required?", type: QuestionType.MULTI_SELECT, required: true, category: "DELIVERABLES", destination: { target: "Deliverable.aspectRatio" }, options: [["16:9", "16:9 landscape"], ["9:16", "9:16 vertical"], ["1:1", "1:1 square"], ["4:5", "4:5 portrait"], ["2.39:1", "2.39:1 cinema"]] },
    { section: "technical", key: "resolution", label: "What resolution and mastering standard are required?", type: QuestionType.SINGLE_SELECT, required: true, category: "DELIVERABLES", destination: { target: "Deliverable.resolution" }, options: [["1080P", "1080p"], ["4K", "4K UHD"], ["8K", "8K"], ["PLATFORM_SPECIFIC", "Platform-specific set"]] },
    { section: "technical", key: "runtime_minutes", label: "What is the target runtime in minutes?", type: QuestionType.NUMBER, required: true, category: "DELIVERABLES", destination: { target: "Project.runtime" } },
    { section: "technical", key: "captions", label: "Are captions, subtitles, transcripts, or translations required?", type: QuestionType.LONG_TEXT, recommended: true, category: "DELIVERABLES", destination: { target: "Deliverable.accessibility" } },

    { section: "budget", key: "budget_range", label: "What budget has been authorized for this scope?", type: QuestionType.CURRENCY, required: true, critical: true, category: "BUDGET", destination: { target: "Quote.authorizedBudget", affectedAreas: ["BUDGET", "QUOTE", "APPROVALS"] } },
    { section: "budget", key: "financial_authority", label: "Who can authorize budget and commercial changes?", type: QuestionType.SHORT_TEXT, required: true, critical: true, category: "BUDGET", destination: { target: "Quote.financialAuthority" } },
    { section: "budget", key: "required_assets_complete", label: "Have all required logos, products, scripts, and references been supplied?", type: QuestionType.BOOLEAN, required: true, critical: true, category: "ASSETS", destination: { target: "Project.assetGate" } },
    { section: "budget", key: "revision_rounds", label: "How many revision rounds should be included?", type: QuestionType.NUMBER, required: true, category: "BUDGET", destination: { target: "Quote.revisionAllowance" } },

    { section: "approvals", key: "stakeholder_approvers", label: "List every stakeholder who will review or approve work.", type: QuestionType.LONG_TEXT, required: true, category: "APPROVALS", destination: { target: "Approval.stakeholders" } },
    { section: "approvals", key: "approval_workflow", label: "Who has final authority, and what is the approval sequence?", type: QuestionType.LONG_TEXT, required: true, critical: true, category: "APPROVALS", validation: { minLength: 20 }, destination: { target: "Approval.workflow", affectedAreas: ["APPROVALS", "SCHEDULE"] } },
    { section: "approvals", key: "feedback_turnaround", label: "How quickly will consolidated feedback be returned?", type: QuestionType.SHORT_TEXT, recommended: true, category: "APPROVALS", destination: { target: "Project.approvalSla" } },

    { section: "legal", key: "uses_third_party_material", label: "Will any third-party footage, music, art, trademarks, or likenesses be used?", type: QuestionType.BOOLEAN, required: true, critical: true, category: "RIGHTS", destination: { target: "ProductionBrief.rightsRequirements", affectedAreas: ["RIGHTS", "APPROVALS", "PRODUCTION_GATE"] } },
    { section: "legal", key: "rights_verified", label: "Are ownership and usage permissions documented and verified?", type: QuestionType.BOOLEAN, required: true, critical: true, category: "RIGHTS", destination: { target: "RightsRecord.status" }, condition: { sourceKey: "uses_third_party_material", operator: "IS_TRUE", expectedValue: true } },
    { section: "legal", key: "usage_territories", label: "Which territories, channels, and duration must usage rights cover?", type: QuestionType.LONG_TEXT, required: true, critical: true, category: "RIGHTS", destination: { target: "RightsRecord.territories" } },
    { section: "legal", key: "product_claims_required", label: "Will the work make health, performance, financial, or product claims?", type: QuestionType.BOOLEAN, required: true, critical: true, category: "LEGAL", destination: { target: "ProductionBrief.claims" } },
    { section: "legal", key: "claim_evidence_available", label: "Is approved substantiation available for every claim?", type: QuestionType.BOOLEAN, required: true, critical: true, category: "LEGAL", destination: { target: "ProductionBrief.claimEvidence" }, condition: { sourceKey: "product_claims_required", operator: "IS_TRUE", expectedValue: true } },
  ];

  for (const [sortIndex, question] of discoveryQuestions.entries()) {
    const sectionId = sectionIds.get(question.section);
    if (!sectionId) throw new Error(`Missing discovery section ${question.section}`);
    const saved = await prisma.questionDefinition.upsert({
      where: { sectionId_key: { sectionId, key: question.key } },
      update: {
        label: question.label,
        type: question.type,
        category: question.category,
        required: question.required ?? false,
        recommended: question.recommended ?? false,
        critical: question.critical ?? false,
        active: true,
        validation: question.validation,
        destination: question.destination,
        reuseKey: question.reuseKey,
        sortOrder: sortIndex + 1,
      },
      create: {
        id: `seed-question-${question.key}`,
        sectionId,
        key: question.key,
        label: question.label,
        type: question.type,
        category: question.category,
        required: question.required ?? false,
        recommended: question.recommended ?? false,
        critical: question.critical ?? false,
        validation: question.validation,
        destination: question.destination,
        reuseKey: question.reuseKey,
        sortOrder: sortIndex + 1,
      },
    });
    for (const [optionIndex, option] of (question.options ?? []).entries()) {
      await prisma.questionOption.upsert({
        where: { id: `seed-option-${question.key}-${optionIndex}` },
        update: { label: option[1], value: option[0], sortOrder: optionIndex + 1 },
        create: { id: `seed-option-${question.key}-${optionIndex}`, questionId: saved.id, label: option[1], value: option[0], sortOrder: optionIndex + 1 },
      });
    }
    if (question.condition) {
      await prisma.questionCondition.upsert({
        where: { id: `seed-condition-${question.key}` },
        update: { operator: question.condition.operator, expectedValue: question.condition.expectedValue },
        create: {
          id: `seed-condition-${question.key}`,
          questionId: saved.id,
          sourceQuestionId: `seed-question-${question.condition.sourceKey}`,
          operator: question.condition.operator,
          expectedValue: question.condition.expectedValue,
        },
      });
    }
  }

  const createClient = async (id: string, displayName: string, industry: string, website: string) =>
    prisma.client.upsert({
      where: { id },
      update: { legalName: `${displayName} LLC`, displayName, industry, website },
      create: { id, organizationId: organization.id, legalName: `${displayName} LLC`, displayName, industry, website },
    });
  const createWonLead = async (id: string, businessName: string, contactName: string, path: ServicePath, opportunityValue: number) =>
    prisma.lead.upsert({
      where: { id },
      update: { businessName, contactName, stage: LeadStage.WON, serviceInterests: [path], opportunityValue },
      create: { id, organizationId: organization.id, ownerId: founder.id, businessName, contactName, email: `${id}@example.invalid`, source: "Pillar One demonstration", stage: LeadStage.WON, serviceInterests: [path], opportunityValue },
    });
  const createIntake = async (id: string, clientId: string, path: ServicePath, completeness: number) =>
    prisma.intake.upsert({
      where: { id },
      update: {
        completeness,
        readinessStatus: DiscoveryReadinessStatus.READY_FOR_PRODUCTION,
        readinessAssessedAt: now,
        compiledBriefVersion: 1,
        confirmedBriefVersion: 1,
        confirmedAt: now,
        confirmedById: founder.id,
        lockedAt: now,
      },
      create: {
        id,
        clientId,
        questionnaireVersionId: questionnaireVersion.id,
        servicePath: path,
        status: IntakeStatus.COMPLETE,
        completeness,
        readiness: { concept: true, preliminaryEstimate: true, fixedQuote: completeness >= 90, production: true },
        readinessStatus: DiscoveryReadinessStatus.READY_FOR_PRODUCTION,
        readinessAssessedAt: now,
        compiledBriefVersion: 1,
        confirmedBriefVersion: 1,
        confirmedAt: now,
        confirmedById: founder.id,
        lockedAt: now,
        submittedAt: now,
      },
    });
  const seedDiscoveryAnswers = async (intakeId: string, answers: Record<string, Prisma.InputJsonValue>) => {
    for (const [key, value] of Object.entries(answers)) {
      const answer = await prisma.intakeAnswer.upsert({
        where: { intakeId_questionId: { intakeId, questionId: `seed-question-${key}` } },
        update: {
          value,
          source: AnswerSource.AUTHORIZED_STAFF,
          verificationStatus: VerificationStatus.STAFF_VERIFIED,
          verifiedById: founder.id,
          verifiedAt: now,
          version: 1,
          isDraft: false,
          answeredById: founder.id,
          answeredAt: now,
        },
        create: {
          id: `seed-answer-${intakeId}-${key}`,
          intakeId,
          questionId: `seed-question-${key}`,
          value,
          source: AnswerSource.AUTHORIZED_STAFF,
          verificationStatus: VerificationStatus.STAFF_VERIFIED,
          verifiedById: founder.id,
          verifiedAt: now,
          version: 1,
          isDraft: false,
          answeredById: founder.id,
          answeredAt: now,
        },
      });
      await prisma.intakeAnswerRevision.upsert({
        where: { answerId_version: { answerId: answer.id, version: 1 } },
        update: { value, verificationStatus: VerificationStatus.STAFF_VERIFIED },
        create: {
          answerId: answer.id,
          version: 1,
          value,
          source: AnswerSource.AUTHORIZED_STAFF,
          verificationStatus: VerificationStatus.STAFF_VERIFIED,
          changedById: founder.id,
          changeReason: "Confirmed during guided discovery",
          changedAt: now,
        },
      });
    }
  };
  const seedDiscoveryOutputs = async (intakeId: string, path: ServicePath, profile: Record<string, Prisma.InputJsonValue>) => {
    const outputs: Array<[DiscoveryOutputType, string, Prisma.InputJsonObject]> = [
      [DiscoveryOutputType.CLIENT_BUSINESS_PROFILE, "Client", { businessName: profile.business_name, industry: profile.industry, businessModel: profile.business_model }],
      [DiscoveryOutputType.BRAND_INTELLIGENCE_PROFILE, "Brand", { voice: profile.brand_voice, values: profile.brand_values, positioning: profile.product_positioning }],
      [DiscoveryOutputType.TARGET_AUDIENCE_PROFILE, "Client", { audience: profile.target_audience, painPoints: profile.audience_pain_points, action: profile.audience_action }],
      [DiscoveryOutputType.CREATIVE_DIRECTION_BRIEF, "ProductionBrief", { objective: profile.primary_objective, style: profile.production_style, voice: profile.brand_voice }],
      [DiscoveryOutputType.TECHNICAL_PRODUCTION_SPECIFICATION, "ProductionBrief", { deliverables: profile.deliverables, platforms: profile.platforms, aspectRatios: profile.aspect_ratios, resolution: profile.resolution }],
      [DiscoveryOutputType.PRELIMINARY_PRICING_ESTIMATE, "Quote", { authorizedBudget: profile.budget_range, deadline: profile.deadline, estimateReady: true }],
      [DiscoveryOutputType.PRODUCTION_READINESS_CHECKLIST, "Project", { status: DiscoveryReadinessStatus.READY_FOR_PRODUCTION, missingRequired: [], unverifiedCritical: [], blockingRisks: [] }],
    ];
    if (([ServicePath.VISUAL_PRODUCTION, ServicePath.COMBINED, ServicePath.ORIGINAL_ENTERTAINMENT] as ServicePath[]).includes(path)) {
      outputs.push(
        [DiscoveryOutputType.SCRIPT_DEVELOPMENT_BRIEF, "ProductionBrief", { dialogue: profile.dialogue, narration: profile.narrator_required, voiceDirection: profile.voice_direction }],
        [DiscoveryOutputType.CHARACTER_ENVIRONMENT_REQUIREMENTS, "ProductionBrief", { characters: profile.characters, locations: profile.locations, props: profile.props }],
        [DiscoveryOutputType.SHOT_SCENE_ESTIMATE, "Project", { sceneCount: profile.scene_count, runtimeMinutes: profile.runtime_minutes }],
        [DiscoveryOutputType.LABOR_ESTIMATE, "Quote", { sceneCount: profile.scene_count, revisionRounds: profile.revision_rounds }],
        [DiscoveryOutputType.AI_GENERATION_REQUIREMENTS, "Project", { style: profile.production_style, aspectRatios: profile.aspect_ratios, productAccuracy: profile.product_accuracy }],
      );
    }
    if (([ServicePath.MANAGED_MARKETING, ServicePath.COMBINED] as ServicePath[]).includes(path)) {
      outputs.push([DiscoveryOutputType.ALPHI_INTEGRATION_PAYLOAD, "IntegrationOutbox", { authorized: false, channels: profile.marketing_channels, audience: profile.target_audience, approvalWorkflow: profile.approval_workflow }]);
    }
    for (const [type, targetType, payload] of outputs) {
      await prisma.discoveryOutput.upsert({
        where: { intakeId_type_version: { intakeId, type, version: 1 } },
        update: { payload, targetType, verifiedOnly: true },
        create: { intakeId, type, version: 1, payload, sourceAnswerKeys: Object.keys(profile), targetType, generatedBy: "PILLAR_ONE_DISCOVERY_ENGINE", verifiedOnly: true },
      });
    }
  };
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
  const commercialClient = await createClient("seed-client-commercial", "Atlas Outdoor", "Outdoor consumer goods", "https://atlas-outdoor.example");
  await createWonLead("seed-lead-commercial", "Atlas Outdoor", "Morgan Lee", ServicePath.VISUAL_PRODUCTION, 2995);
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
  const commercialDiscovery = {
    service_path: [ServicePath.VISUAL_PRODUCTION],
    objective: "Launch the Summit Bottle with a premium commercial that demonstrates durability and converts outdoor enthusiasts.",
    deadline: "2026-02-28",
    production_style: "Cinematic mountain sunrise, natural texture, restrained typography, and precise product detail.",
    business_name: "Atlas Outdoor",
    business_model: "Direct-to-consumer outdoor equipment sold through ecommerce and specialty retail partners.",
    industry: "Outdoor consumer goods",
    website: "https://atlas-outdoor.example",
    primary_objective: "Increase qualified product-page visits and achieve a measurable lift in Summit Bottle launch sales.",
    brand_voice: "Adventurous, capable, grounded, optimistic, and never exaggerated.",
    brand_values: "Durability, responsible exploration, practical innovation, and respect for natural environments.",
    visual_identity: "Deep forest green, warm sunrise gold, documentary photography, Atlas wordmark, and clean product callouts.",
    competitors: "Premium insulated bottle and outdoor hydration brands positioned around performance and lifestyle.",
    product_positioning: "A field-ready insulated bottle designed for demanding days without unnecessary complexity.",
    target_audience: "US outdoor enthusiasts aged 25-44 who hike, camp, travel, and buy durable premium gear.",
    audience_pain_points: "Leaking lids, poor temperature retention, fragile finishes, and products that feel over-engineered.",
    audience_action: "Trust the bottle's durability, visit the product page, and purchase for the next trip.",
    audience_locations: "United States, primarily mountain west and coastal outdoor markets.",
    scene_count: 5,
    locations: "Mountain trail at sunrise, rocky overlook, campsite table, and clean studio product environment.",
    characters: 1,
    character_identity: "One experienced female hiker in her early thirties with practical layered outdoor clothing and consistent braid continuity.",
    dialogue: false,
    narrator_required: true,
    voice_direction: "Warm, confident US English voice, conversational rather than announcer-like, with restrained pacing.",
    props: "Summit Bottle in correct forest-green finish, hiking pack, trail map, camp mug, and climbing rope.",
    product_accuracy: "Exact cap geometry, Atlas logo placement, forest-green finish, steel rim, and correct 24-ounce proportions.",
    soundtrack: "Licensed cinematic acoustic pulse with natural ambience and perpetual paid-ad usage in the United States.",
    deliverables: "Thirty-second master, fifteen-second cutdown, and six-second bumper with clean and captioned versions.",
    platforms: ["WEB", "SOCIAL"],
    aspect_ratios: ["16:9", "9:16", "1:1"],
    resolution: "4K",
    runtime_minutes: 0.5,
    captions: "Open-caption and clean masters; English SRT transcript.",
    budget_range: 2995,
    financial_authority: "Morgan Lee, VP of Marketing, may authorize the approved budget and written change orders.",
    required_assets_complete: true,
    revision_rounds: 2,
    stakeholder_approvers: ["Morgan Lee — final authority", "Jamie Ortiz — product accuracy"],
    approval_workflow: "Jamie verifies product fidelity first; Morgan provides one consolidated final approval within two business days.",
    feedback_turnaround: "Two business days with one consolidated response.",
    uses_third_party_material: false,
    usage_territories: "United States, web and paid social, perpetual brand-owned usage.",
    product_claims_required: false,
  };
  await seedDiscoveryAnswers(commercialIntake.id, commercialDiscovery);
  await seedDiscoveryOutputs(commercialIntake.id, ServicePath.VISUAL_PRODUCTION, commercialDiscovery);
  await prisma.discoveryConfirmation.upsert({
    where: { intakeId_briefVersion: { intakeId: commercialIntake.id, briefVersion: 1 } },
    update: { confirmation: "Atlas confirms this compiled brief accurately represents the approved production requirements." },
    create: { intakeId: commercialIntake.id, briefVersion: 1, confirmedById: founder.id, confirmerName: "Morgan Lee", confirmerEmail: "morgan@atlas-outdoor.example", confirmation: "Atlas confirms this compiled brief accurately represents the approved production requirements.", confirmedAt: now },
  });
  await prisma.discoveryCollaborator.upsert({
    where: { intakeId_email: { intakeId: commercialIntake.id, email: "jamie@atlas-outdoor.example" } },
    update: { name: "Jamie Ortiz", role: "PRODUCT_ACCURACY_REVIEWER", permissions: ["VIEW", "COMMENT", "VERIFY_PRODUCT"] },
    create: { intakeId: commercialIntake.id, email: "jamie@atlas-outdoor.example", name: "Jamie Ortiz", role: "PRODUCT_ACCURACY_REVIEWER", permissions: ["VIEW", "COMMENT", "VERIFY_PRODUCT"], invitedById: founder.id, acceptedAt: now },
  });
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
    update: { sections: { scope: [{ description: "30-second cinematic production" }, { description: "One master and three platform cutdowns" }], timeline: true, rights: true, paymentSchedule: ["50%", "25%", "25%"], investment: { total: "2995.00", currency: "USD" } } },
    create: { proposalId: commercialProposal.id, version: 1, templateKey: "visual-production", sections: { scope: [{ description: "30-second cinematic production" }, { description: "One master and three platform cutdowns" }], timeline: true, rights: true, paymentSchedule: ["50%", "25%", "25%"], investment: { total: "2995.00", currency: "USD" } } },
  });
  const commercialProject = await prisma.project.upsert({
    where: { quoteId: commercialQuote.id },
    update: {},
    create: { id: "seed-project-commercial", organizationId: organization.id, clientId: commercialClient.id, quoteId: commercialQuote.id, title: "Summit Bottle Commercial", servicePath: ServicePath.VISUAL_PRODUCTION, status: ProjectStatus.COMPLETED, budget: 1347.75, actualCost: 1290 },
  });
  await prisma.intake.update({ where: { id: commercialIntake.id }, data: { projectId: commercialProject.id } });
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
      update: { requestedAt: now, decidedAt: now },
      create: { id: `seed-approval-commercial-${index}`, projectId: commercialProject.id, type, status: ApprovalStatus.APPROVED, requestedAt: now, decidedById: founder.id, decidedAt: now },
    });
  }
  const finalAsset = await prisma.asset.upsert({
    where: { id: "seed-asset-commercial-master" },
    update: {},
    create: { id: "seed-asset-commercial-master", projectId: commercialProject.id, clientId: commercialClient.id, ownerOrganizationId: organization.id, category: "FINAL_DELIVERABLE", name: "Summit Bottle Master", storageKey: "seed/commercial/master.mp4", mimeType: "video/mp4", sizeBytes: 1, status: AssetStatus.AVAILABLE, approvalStatus: ApprovalStatus.APPROVED },
  });
  const referenceAsset = await prisma.asset.upsert({
    where: { id: "seed-asset-atlas-brand-guide" },
    update: {},
    create: { id: "seed-asset-atlas-brand-guide", projectId: commercialProject.id, clientId: commercialClient.id, ownerOrganizationId: organization.id, category: "BRAND_GUIDE", name: "Atlas Brand Guide.pdf", storageKey: "seed/commercial/atlas-brand-guide.pdf", mimeType: "application/pdf", sizeBytes: 1, status: AssetStatus.AVAILABLE, approvalStatus: ApprovalStatus.APPROVED },
  });
  await prisma.discoveryMaterial.upsert({
    where: { intakeId_assetId: { intakeId: commercialIntake.id, assetId: referenceAsset.id } },
    update: { extractedData: { detectedColors: ["forest green", "sunrise gold"], detectedVoice: "adventurous, grounded" }, verificationStatus: VerificationStatus.UNVERIFIED },
    create: {
      intakeId: commercialIntake.id,
      assetId: referenceAsset.id,
      category: "BRAND_GUIDE",
      description: "Client-supplied brand guide used as a visual and voice reference.",
      extractedData: { detectedColors: ["forest green", "sunrise gold"], detectedVoice: "adventurous, grounded" },
      extractionProvider: "DEMO_DOCUMENT_EXTRACTION",
      verificationStatus: VerificationStatus.UNVERIFIED,
    },
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
  await prisma.expense.upsert({
    where: { id: "seed-expense-commercial-production" },
    update: { amount: 1290, incurredAt: now },
    create: { id: "seed-expense-commercial-production", organizationId: organization.id, projectId: commercialProject.id, category: "PRODUCTION", vendor: "Five Pillar Studio", description: "Summit Bottle production and post-production", amount: 1290, incurredAt: now, billable: true },
  });

  // Scenario B: managed marketing onboarding with founder labor and attributable Alphi infrastructure.
  const marketingClient = await createClient("seed-client-marketing", "Harbor Health", "Healthcare services", "https://harbor-health.example");
  await createWonLead("seed-lead-marketing", "Harbor Health", "Avery Brooks", ServicePath.MANAGED_MARKETING, 3250);
  const marketingIntake = await createIntake("seed-intake-marketing", marketingClient.id, ServicePath.MANAGED_MARKETING, 100);
  const marketingDiscovery = {
    service_path: [ServicePath.MANAGED_MARKETING],
    objective: "Build a compliant education-led campaign that increases qualified preventive-care appointment requests.",
    deadline: "2026-03-31",
    marketing_channels: ["INSTAGRAM", "LINKEDIN", "EMAIL"],
    business_name: "Harbor Health",
    business_model: "Regional healthcare practice earning service revenue from insured and self-pay patient visits.",
    industry: "Healthcare services",
    website: "https://harbor-health.example",
    primary_objective: "Increase qualified preventive-care appointment requests by twenty percent while preserving patient trust.",
    brand_voice: "Reassuring, clear, inclusive, evidence-led, and practical.",
    brand_values: "Patient dignity, access, prevention, clinical accuracy, and community care.",
    visual_identity: "Calm blue-green palette, accessible typography, real community imagery, and generous whitespace.",
    competitors: "Regional hospital networks, urgent-care groups, and direct-to-consumer telehealth providers.",
    product_positioning: "Approachable local preventive care with coordinated follow-through and transparent patient education.",
    target_audience: "Adults aged 30-60 within the regional service area who have delayed routine preventive care.",
    audience_pain_points: "Confusing healthcare information, scheduling friction, cost uncertainty, and fear of judgment.",
    audience_action: "Understand the value of preventive care and request an appointment through the secure booking page.",
    audience_locations: "Three-county regional service area surrounding Harbor Health clinics.",
    campaign_objectives: "Generate qualified appointment requests, improve educational engagement, and reduce booking-page abandonment.",
    content_volume: 12,
    existing_marketing_data: "De-identified website analytics, approved service-line performance, channel engagement, and call-center themes.",
    alphi_integration: true,
    deliverables: "Monthly content strategy, twelve approved posts, three email modules, campaign calendar, and performance report.",
    platforms: ["SOCIAL", "WEB"],
    aspect_ratios: ["1:1", "4:5", "9:16"],
    resolution: "PLATFORM_SPECIFIC",
    runtime_minutes: 0.5,
    captions: "All video assets require burned-in captions and accessible text alternatives.",
    budget_range: 3250,
    financial_authority: "Avery Brooks, Director of Growth, approves budget; compliance counsel approves regulated language.",
    required_assets_complete: true,
    revision_rounds: 2,
    stakeholder_approvers: "Avery Brooks, clinical lead Dr. Ruiz, and compliance counsel Dana Patel.",
    approval_workflow: "Clinical accuracy review precedes compliance review; Avery provides final consolidated campaign approval.",
    feedback_turnaround: "Three business days for consolidated feedback.",
    uses_third_party_material: false,
    usage_territories: "Regional United States digital channels for twelve months.",
    product_claims_required: true,
    claim_evidence_available: true,
  };
  await seedDiscoveryAnswers(marketingIntake.id, marketingDiscovery);
  await seedDiscoveryOutputs(marketingIntake.id, ServicePath.MANAGED_MARKETING, marketingDiscovery);
  await prisma.discoveryConfirmation.upsert({
    where: { intakeId_briefVersion: { intakeId: marketingIntake.id, briefVersion: 1 } },
    update: { confirmation: "Harbor Health confirms the discovery brief and regulated-claims review workflow." },
    create: { intakeId: marketingIntake.id, briefVersion: 1, confirmedById: founder.id, confirmerName: "Avery Brooks", confirmerEmail: "avery@harbor-health.example", confirmation: "Harbor Health confirms the discovery brief and regulated-claims review workflow.", confirmedAt: now },
  });
  await prisma.serviceSubscription.upsert({
    where: { id: "seed-service-sub-marketing" },
    update: {},
    create: { id: "seed-service-sub-marketing", clientId: marketingClient.id, subscriptionId: alphi.id, packageName: "Managed Marketing Level 3", serviceLevel: 3, onboardingFee: 750, monthlyFee: 2500, minimumTermMonths: 3, startsAt: now, deliverables: { channels: ["Instagram", "LinkedIn"], reporting: "monthly", approvalRequired: true }, founderHours: 4 },
  });
  const marketingQuote = await createQuote("seed-quote-marketing", marketingClient.id, "Managed Marketing Onboarding", ServicePath.MANAGED_MARKETING, 1450, 3250, QuoteStatus.ACCEPTED);
  const marketingProposal = await prisma.proposal.upsert({
    where: { id: "seed-proposal-marketing" },
    update: {},
    create: { id: "seed-proposal-marketing", organizationId: organization.id, clientId: marketingClient.id, quoteId: marketingQuote.id, status: ProposalStatus.ACCEPTED },
  });
  await prisma.proposalVersion.upsert({
    where: { proposalId_version: { proposalId: marketingProposal.id, version: 1 } },
    update: { sections: { scope: [{ description: "Managed marketing onboarding" }, { description: "Monthly campaign operations and reporting" }], investment: { total: "3250.00", currency: "USD" } } },
    create: { proposalId: marketingProposal.id, version: 1, templateKey: "managed-marketing", sections: { scope: [{ description: "Managed marketing onboarding" }, { description: "Monthly campaign operations and reporting" }], investment: { total: "3250.00", currency: "USD" } } },
  });
  const marketingProject = await prisma.project.upsert({
    where: { quoteId: marketingQuote.id },
    update: {},
    create: { id: "seed-project-marketing", organizationId: organization.id, clientId: marketingClient.id, quoteId: marketingQuote.id, title: "Harbor Health Managed Marketing", servicePath: ServicePath.MANAGED_MARKETING, status: ProjectStatus.AWAITING_ASSETS, budget: 1450 },
  });
  await prisma.intake.update({ where: { id: marketingIntake.id }, data: { projectId: marketingProject.id } });
  await prisma.subscriptionAllocation.upsert({
    where: { subscriptionId_projectId_periodStart: { subscriptionId: alphi.id, projectId: marketingProject.id, periodStart: now } },
    update: {},
    create: { subscriptionId: alphi.id, projectId: marketingProject.id, periodStart: now, periodEnd: monthEnd, method: AllocationMethod.ACTUAL_USAGE, allocatedAmount: 65, rationale: "Attributable managed-service infrastructure only." },
  });

  // Scenario C: hybrid proposal keeps studio production and recurring managed services separate.
  const hybridClient = await createClient("seed-client-hybrid", "Northstar Foods", "Food and beverage", "https://northstar-foods.example");
  await createWonLead("seed-lead-hybrid", "Northstar Foods", "Jordan Kim", ServicePath.COMBINED, 8000);
  const hybridIntake = await createIntake("seed-intake-hybrid", hybridClient.id, ServicePath.COMBINED, 100);
  const hybridDiscovery = {
    service_path: [ServicePath.COMBINED],
    objective: "Launch Northstar's new snack line with one hero commercial and a coordinated three-month social campaign.",
    deadline: "2026-04-15",
    production_style: "Bright tactile food cinematography, energetic motion, real ingredient texture, and premium natural-light styling.",
    marketing_channels: ["INSTAGRAM", "TIKTOK", "YOUTUBE"],
    business_name: "Northstar Foods",
    business_model: "Packaged food sold through grocery distribution, ecommerce, and regional retail partnerships.",
    industry: "Food and beverage",
    website: "https://northstar-foods.example",
    primary_objective: "Create initial product awareness, secure retail velocity, and build a reusable library for launch marketing.",
    brand_voice: "Bright, honest, energetic, ingredient-conscious, and family-friendly.",
    brand_values: "Simple ingredients, joyful discovery, transparent sourcing, and everyday convenience.",
    visual_identity: "Saturated flavor colors, cream backgrounds, bold pack photography, playful geometric accents, and Northstar icon.",
    competitors: "Premium better-for-you snack brands competing for grocery shelf attention and social discovery.",
    product_positioning: "A craveable snack with recognizable ingredients and bold flavor, without wellness-culture judgment.",
    target_audience: "Busy adults and parents aged 25-45 seeking flavorful snacks with understandable ingredients.",
    audience_pain_points: "Bland better-for-you products, confusing labels, artificial presentation, and repetitive lunchbox options.",
    audience_action: "Recognize the packaging, watch the product story, and purchase online or at launch retailers.",
    audience_locations: "Initial Midwest and Northeast retail markets plus nationwide ecommerce.",
    campaign_objectives: "Generate launch reach, retailer-aware engagement, product-page traffic, and a reusable audience learning loop.",
    content_volume: 16,
    existing_marketing_data: "Retail sell-through by region, ecommerce analytics, approved consumer research, and prior social engagement.",
    alphi_integration: true,
    scene_count: 6,
    locations: "Sunlit kitchen, graphic tabletop environment, grocery shelf simulation, and colorful ingredient world.",
    characters: 2,
    character_identity: "Two friends in their early thirties with consistent wardrobe palettes and natural comedic chemistry.",
    dialogue: true,
    narrator_required: false,
    props: "Final retail packaging, serving bowls, approved raw ingredients, lunch tote, and grocery shelf facings.",
    product_accuracy: "Exact package colors, nutrition-panel proportions, flavor naming, ingredient appearance, and trademark placement.",
    soundtrack: "Original upbeat percussion and melodic hook with perpetual brand-owned digital and retail usage.",
    deliverables: "Forty-five-second hero, two fifteen-second edits, six short social cuts, still selects, and three-month content plan.",
    platforms: ["WEB", "SOCIAL"],
    aspect_ratios: ["16:9", "9:16", "1:1", "4:5"],
    resolution: "4K",
    runtime_minutes: 0.75,
    captions: "English captions, clean masters, and platform-safe text zones.",
    budget_range: 8000,
    financial_authority: "Jordan Kim can approve the launch allocation; changes above ten percent require the COO.",
    required_assets_complete: true,
    revision_rounds: 2,
    stakeholder_approvers: "Jordan Kim has final authority after product, legal, and retail-channel review.",
    approval_workflow: "Product verifies packaging, legal checks claims, retail reviews channel needs, then Jordan issues one consolidated approval.",
    feedback_turnaround: "Two business days at concept and rough-cut stages.",
    uses_third_party_material: false,
    usage_territories: "United States owned, paid, ecommerce, and retail media for three years.",
    product_claims_required: true,
    claim_evidence_available: true,
  };
  await seedDiscoveryAnswers(hybridIntake.id, hybridDiscovery);
  await seedDiscoveryOutputs(hybridIntake.id, ServicePath.COMBINED, hybridDiscovery);
  await prisma.discoveryConfirmation.upsert({
    where: { intakeId_briefVersion: { intakeId: hybridIntake.id, briefVersion: 1 } },
    update: { confirmation: "Northstar Foods confirms the combined production and campaign discovery brief." },
    create: { intakeId: hybridIntake.id, briefVersion: 1, confirmedById: founder.id, confirmerName: "Jordan Kim", confirmerEmail: "jordan@northstar-foods.example", confirmation: "Northstar Foods confirms the combined production and campaign discovery brief.", confirmedAt: now },
  });
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
  const hybridProposal = await prisma.proposal.upsert({
    where: { id: "seed-proposal-hybrid" },
    update: {},
    create: { id: "seed-proposal-hybrid", organizationId: organization.id, clientId: hybridClient.id, quoteId: hybridQuote.id, status: ProposalStatus.ACCEPTED },
  });
  await prisma.proposalVersion.upsert({
    where: { proposalId_version: { proposalId: hybridProposal.id, version: 1 } },
    update: { sections: { scope: [{ description: "Original launch commercial" }, { description: "Monthly managed marketing campaign" }], investment: { total: "8000.00", currency: "USD" } } },
    create: { proposalId: hybridProposal.id, version: 1, templateKey: "combined", sections: { scope: [{ description: "Original launch commercial" }, { description: "Monthly managed marketing campaign" }], investment: { total: "8000.00", currency: "USD" } } },
  });
  const hybridProject = await prisma.project.upsert({
    where: { quoteId: hybridQuote.id },
    update: {},
    create: { id: "seed-project-hybrid", organizationId: organization.id, clientId: hybridClient.id, quoteId: hybridQuote.id, title: "Northstar Launch", servicePath: ServicePath.COMBINED, status: ProjectStatus.PRODUCTION_READY, budget: 3600 },
  });
  await prisma.intake.update({ where: { id: hybridIntake.id }, data: { projectId: hybridProject.id } });
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
