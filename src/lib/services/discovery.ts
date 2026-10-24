import {
  AnswerSource,
  ClarificationStatus,
  DiscoveryImpactStatus,
  Prisma,
  VerificationStatus,
  type DiscoveryOutputType,
} from "@prisma/client";
import type { AuthPrincipal } from "@/lib/auth";
import {
  affectedAreas,
  assessDiscovery,
  generateDiscoveryOutputs,
  reusableAnswers,
  type DiscoveryAnswer,
  type DiscoveryQuestion,
} from "@/lib/discovery";
import { db } from "@/lib/db";
import { ServiceError } from "./errors";
import { guard } from "./helpers";
import {
  discoveryAnswerSchema,
  discoveryCollaboratorSchema,
  discoveryConfirmationSchema,
  discoveryMaterialSchema,
  discoveryQuestionSchema,
  discoveryQuestionUpdateSchema,
  discoveryVerificationSchema,
  serviceTypeDefinitionSchema,
} from "./inputs";

type Tx = Prisma.TransactionClient;

const questionInclude = {
  options: { orderBy: { sortOrder: "asc" as const } },
  conditions: { include: { sourceQuestion: { select: { key: true } } } },
} satisfies Prisma.QuestionDefinitionInclude;

function asObject(value: Prisma.JsonValue | null): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function jsonInput(value: Prisma.JsonValue | unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  return value === null ? Prisma.JsonNull : value as Prisma.InputJsonValue;
}

function runtimeQuestion(question: Prisma.QuestionDefinitionGetPayload<{ include: typeof questionInclude }>): DiscoveryQuestion {
  return {
    id: question.id,
    key: question.key,
    label: question.label,
    category: question.category,
    type: question.type,
    required: question.required,
    recommended: question.recommended,
    critical: question.critical,
    active: question.active,
    reuseKey: question.reuseKey,
    validation: asObject(question.validation),
    destination: asObject(question.destination),
    conditions: question.conditions.map((condition) => ({
      sourceKey: condition.sourceQuestion.key,
      operator: condition.operator,
      expectedValue: condition.expectedValue,
    })),
  };
}

function runtimeAnswer(answer: {
  questionId: string;
  value: Prisma.JsonValue;
  source: AnswerSource;
  verificationStatus: VerificationStatus;
  version: number;
  question: { key: string };
}): DiscoveryAnswer {
  return {
    questionId: answer.questionId,
    key: answer.question.key,
    value: answer.value,
    source: answer.source,
    verificationStatus: answer.verificationStatus,
    version: answer.version,
  };
}

async function scopedIntake(principal: AuthPrincipal, id: string) {
  const intake = await db.intake.findFirst({
    where: {
      id,
      questionnaireVersion: { definition: { organizationId: principal.organizationId } },
    },
    select: { id: true, clientId: true, projectId: true },
  });
  if (!intake) throw new ServiceError("NOT_FOUND", "Discovery session not found", 404);
  guard(principal, principal.role === "CLIENT" ? "portal:read" : "production:read", {
    organizationId: principal.organizationId,
    clientId: intake.clientId,
    projectId: intake.projectId,
  });
  return intake;
}

async function audit(
  tx: Tx,
  principal: AuthPrincipal,
  action: string,
  entityId: string,
  after: Prisma.InputJsonValue,
) {
  await tx.auditEvent.create({
    data: {
      organizationId: principal.organizationId,
      actorId: principal.userId,
      action,
      entityType: "Intake",
      entityId,
      after,
    },
  });
}

async function discoverySource(tx: Tx, id: string) {
  const intake = await tx.intake.findUnique({
    where: { id },
    include: {
      questionnaireVersion: {
        include: {
          sections: {
            orderBy: { sortOrder: "asc" },
            include: { questions: { orderBy: { sortOrder: "asc" }, include: questionInclude } },
          },
        },
      },
      answers: { include: { question: { select: { key: true } } } },
      project: { select: { status: true } },
    },
  });
  if (!intake) throw new ServiceError("NOT_FOUND", "Discovery session not found", 404);
  const questions = intake.questionnaireVersion.sections.flatMap((section) => section.questions.map(runtimeQuestion));
  const answers = intake.answers.map(runtimeAnswer);
  return { intake, questions, answers };
}

function outputPayload(outputs: ReturnType<typeof generateDiscoveryOutputs>, type: DiscoveryOutputType) {
  return outputs.find((output) => output.type === type)?.payload ?? {};
}

async function refreshDiscoveryState(tx: Tx, intakeId: string) {
  const { intake, questions, answers } = await discoverySource(tx, intakeId);
  const assessment = assessDiscovery(questions, answers, {
    briefConfirmed: intake.confirmedBriefVersion === intake.compiledBriefVersion && intake.compiledBriefVersion > 0,
    finalApproval: intake.project?.status === "FINAL_APPROVAL" || intake.project?.status === "AWAITING_FINAL_PAYMENT" || intake.project?.status === "DELIVERY" || intake.project?.status === "COMPLETED",
    finalPayment: intake.project?.status === "DELIVERY" || intake.project?.status === "COMPLETED",
  });
  const nextVersion = intake.compiledBriefVersion + 1;
  const outputs = generateDiscoveryOutputs(answers, intake.servicePath, assessment);

  await tx.intake.update({
    where: { id: intakeId },
    data: {
      completeness: assessment.completeness,
      readinessStatus: assessment.readinessStatus,
      readinessAssessedAt: new Date(),
      readiness: {
        missingRequired: assessment.missingRequired.map((question) => question.key),
        missingRecommended: assessment.missingRecommended.map((question) => question.key),
        unverifiedCritical: assessment.unverifiedCritical.map((question) => question.key),
        readyForPreliminaryEstimate: assessment.readyForPreliminaryEstimate,
        readyForFirmQuotation: assessment.readyForFirmQuotation,
        readyForProduction: assessment.readyForProduction,
      },
      compiledBriefVersion: nextVersion,
    },
  });

  await tx.discoveryRisk.updateMany({ where: { intakeId, resolvedAt: null }, data: { resolvedAt: new Date() } });
  for (const risk of assessment.risks) {
    await tx.discoveryRisk.upsert({
      where: { intakeId_code: { intakeId, code: risk.code } },
      update: {
        title: risk.title,
        description: risk.description,
        severity: risk.severity,
        category: risk.category,
        blocking: risk.blocking,
        evidence: risk.evidence as Prisma.InputJsonValue | undefined,
        resolvedAt: null,
      },
      create: {
        intakeId,
        code: risk.code,
        title: risk.title,
        description: risk.description,
        severity: risk.severity,
        category: risk.category,
        blocking: risk.blocking,
        evidence: risk.evidence as Prisma.InputJsonValue | undefined,
      },
    });
  }

  await tx.discoveryClarification.deleteMany({
    where: { intakeId, status: ClarificationStatus.OPEN, origin: AnswerSource.AI_RECOMMENDATION },
  });
  if (assessment.clarifications.length) {
    await tx.discoveryClarification.createMany({
      data: assessment.clarifications.map((clarification) => ({
        intakeId,
        questionId: questions.find((question) => question.key === clarification.questionKey)?.id,
        origin: clarification.origin,
        reasonCode: clarification.reasonCode,
        prompt: clarification.prompt,
        rationale: clarification.rationale,
      })),
    });
  }

  await tx.discoveryOutput.createMany({
    data: outputs.map((output) => ({
      intakeId,
      type: output.type,
      version: nextVersion,
      payload: output.payload as Prisma.InputJsonValue,
      sourceAnswerKeys: output.sourceAnswerKeys,
      targetType: output.targetType,
      generatedBy: "PILLAR_ONE_DISCOVERY_ENGINE",
      verifiedOnly: true,
    })),
  });

  const briefPayload = {
    businessProfile: outputPayload(outputs, "CLIENT_BUSINESS_PROFILE"),
    brandProfile: outputPayload(outputs, "BRAND_INTELLIGENCE_PROFILE"),
    audience: outputPayload(outputs, "TARGET_AUDIENCE_PROFILE"),
    creativeDirection: outputPayload(outputs, "CREATIVE_DIRECTION_BRIEF"),
    productionRequirements: outputPayload(outputs, "TECHNICAL_PRODUCTION_SPECIFICATION"),
    rightsRequirements: {
      risks: assessment.risks.filter((risk) => risk.category === "RIGHTS" || risk.category === "LEGAL").map((risk) => risk.code),
      verified: assessment.unverifiedCritical.length === 0,
    },
  };
  const existingBrief = await tx.productionBrief.findFirst({ where: { intakeId }, orderBy: { id: "asc" } });
  if (existingBrief && !intake.lockedAt) {
    await tx.productionBrief.update({
      where: { id: existingBrief.id },
      data: {
        title: `Compiled discovery brief v${nextVersion}`,
        objectives: briefPayload.businessProfile as Prisma.InputJsonValue,
        audience: briefPayload.audience as Prisma.InputJsonValue,
        creativeDirection: briefPayload.creativeDirection as Prisma.InputJsonValue,
        productionRequirements: briefPayload.productionRequirements as Prisma.InputJsonValue,
        sourceMaterials: { materialCount: await tx.discoveryMaterial.count({ where: { intakeId } }) },
        rightsRequirements: briefPayload.rightsRequirements,
        approvedAt: null,
      },
    });
  } else if (!existingBrief) {
    await tx.productionBrief.create({
      data: {
        intakeId,
        title: `Compiled discovery brief v${nextVersion}`,
        objectives: briefPayload.businessProfile as Prisma.InputJsonValue,
        audience: briefPayload.audience as Prisma.InputJsonValue,
        creativeDirection: briefPayload.creativeDirection as Prisma.InputJsonValue,
        productionRequirements: briefPayload.productionRequirements as Prisma.InputJsonValue,
        sourceMaterials: { materialCount: await tx.discoveryMaterial.count({ where: { intakeId } }) },
        rightsRequirements: briefPayload.rightsRequirements,
      },
    });
  }
  return assessment;
}

export async function listDiscoverySessions(principal: AuthPrincipal) {
  guard(principal, principal.role === "CLIENT" ? "portal:read" : "production:read");
  return db.intake.findMany({
    where: {
      questionnaireVersion: { definition: { organizationId: principal.organizationId } },
      ...(principal.role === "CLIENT" ? { clientId: principal.clientId ?? "__none__" } : {}),
    },
    select: {
      id: true,
      servicePath: true,
      status: true,
      completeness: true,
      readinessStatus: true,
      readinessAssessedAt: true,
      compiledBriefVersion: true,
      confirmedBriefVersion: true,
      updatedAt: true,
      client: { select: { id: true, displayName: true } },
      project: { select: { id: true, title: true, status: true } },
      _count: { select: { answers: true, materials: true, clarifications: true, risks: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getDiscoveryWorkspace(principal: AuthPrincipal, id: string) {
  await scopedIntake(principal, id);
  const intake = await db.intake.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, displayName: true } },
      project: { select: { id: true, title: true, status: true } },
      serviceType: true,
      questionnaireVersion: {
        include: {
          sections: {
            orderBy: { sortOrder: "asc" },
            include: { questions: { orderBy: { sortOrder: "asc" }, include: questionInclude } },
          },
        },
      },
      answers: {
        include: {
          question: { select: { key: true, label: true, category: true } },
          revisions: { orderBy: { version: "desc" }, take: 20 },
        },
      },
      materials: { include: { asset: { select: { id: true, name: true, category: true, mimeType: true, status: true, approvalStatus: true } } } },
      clarifications: { where: { status: ClarificationStatus.OPEN }, orderBy: { createdAt: "asc" } },
      risks: { where: { resolvedAt: null }, orderBy: [{ blocking: "desc" }, { severity: "desc" }] },
      outputs: { orderBy: [{ version: "desc" }, { type: "asc" }] },
      impacts: { where: { status: DiscoveryImpactStatus.OPEN }, orderBy: { createdAt: "desc" } },
      collaborators: { orderBy: { createdAt: "asc" } },
      confirmations: { orderBy: { briefVersion: "desc" } },
      briefs: { orderBy: { id: "asc" } },
    },
  });
  if (!intake) throw new ServiceError("NOT_FOUND", "Discovery session not found", 404);
  const runtimeQuestions = intake.questionnaireVersion.sections.flatMap((section) => section.questions.map(runtimeQuestion));
  const runtimeAnswers = intake.answers.map(runtimeAnswer);
  const assessment = assessDiscovery(runtimeQuestions, runtimeAnswers, {
    briefConfirmed: intake.confirmedBriefVersion === intake.compiledBriefVersion && intake.compiledBriefVersion > 0,
    finalApproval: ["FINAL_APPROVAL", "AWAITING_FINAL_PAYMENT", "DELIVERY", "COMPLETED"].includes(intake.project?.status ?? ""),
    finalPayment: ["DELIVERY", "COMPLETED"].includes(intake.project?.status ?? ""),
  });
  const visibleIds = new Set(assessment.visibleQuestions.map((question) => question.id));
  return {
    ...intake,
    questionnaireVersion: {
      ...intake.questionnaireVersion,
      sections: intake.questionnaireVersion.sections.map((section) => ({
        ...section,
        questions: section.questions.filter((question) => visibleIds.has(question.id)),
      })).filter((section) => section.questions.some((question) => visibleIds.has(question.id))),
    },
    assessment,
    latestOutputs: Object.values(Object.fromEntries(intake.outputs.slice().reverse().map((output) => [output.type, output]))),
  };
}

export async function saveDiscoveryAnswers(principal: AuthPrincipal, id: string, raw: unknown) {
  const scope = await scopedIntake(principal, id);
  guard(principal, principal.role === "CLIENT" ? "portal:read" : "production:write", {
    organizationId: principal.organizationId,
    clientId: scope.clientId,
    projectId: scope.projectId,
  });
  const input = discoveryAnswerSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const intake = await tx.intake.findUnique({
      where: { id },
      select: {
        lockedAt: true,
        questionnaireVersion: { select: { sections: { select: { questions: { select: { id: true, key: true, category: true, destination: true } } } } } },
      },
    });
    if (!intake) throw new ServiceError("NOT_FOUND", "Discovery session not found", 404);
    const questions = intake.questionnaireVersion.sections.flatMap((section) => section.questions);
    const questionMap = new Map(questions.map((question) => [question.id, question]));
    for (const candidate of input.answers) {
      const question = questionMap.get(candidate.questionId);
      if (!question) throw new ServiceError("INVALID_QUESTION", "Question is not part of this discovery version", 400);
      const prior = await tx.intakeAnswer.findUnique({ where: { intakeId_questionId: { intakeId: id, questionId: candidate.questionId } } });
      const version = (prior?.version ?? 0) + 1;
      const verificationStatus = principal.role === "CLIENT"
        ? VerificationStatus.UNVERIFIED
        : candidate.verificationStatus;
      const source = principal.role === "CLIENT" ? AnswerSource.CLIENT : candidate.source;
      const saved = await tx.intakeAnswer.upsert({
        where: { intakeId_questionId: { intakeId: id, questionId: candidate.questionId } },
        update: {
          value: candidate.value as Prisma.InputJsonValue,
          source,
          sourceReference: candidate.sourceReference,
          verificationStatus,
          verifiedById: verificationStatus === VerificationStatus.STAFF_VERIFIED ? principal.userId : null,
          verifiedAt: verificationStatus === VerificationStatus.STAFF_VERIFIED ? new Date() : null,
          version,
          isDraft: true,
          answeredById: principal.userId,
          answeredAt: new Date(),
        },
        create: {
          intakeId: id,
          questionId: candidate.questionId,
          value: candidate.value as Prisma.InputJsonValue,
          source,
          sourceReference: candidate.sourceReference,
          verificationStatus,
          verifiedById: verificationStatus === VerificationStatus.STAFF_VERIFIED ? principal.userId : null,
          verifiedAt: verificationStatus === VerificationStatus.STAFF_VERIFIED ? new Date() : null,
          version,
          isDraft: true,
          answeredById: principal.userId,
        },
      });
      await tx.intakeAnswerRevision.create({
        data: {
          answerId: saved.id,
          version,
          value: candidate.value as Prisma.InputJsonValue,
          source,
          sourceReference: candidate.sourceReference,
          verificationStatus,
          changedById: principal.userId,
          changeReason: input.changeReason,
        },
      });
      if (intake.lockedAt && prior && JSON.stringify(prior.value) !== JSON.stringify(candidate.value)) {
        const runtime: DiscoveryQuestion = {
          id: question.id,
          key: question.key,
          label: question.key,
          category: question.category,
          type: "SHORT_TEXT",
          required: false,
          recommended: false,
          critical: false,
          active: true,
          destination: asObject(question.destination),
          conditions: [],
        };
        await tx.discoveryImpact.create({
          data: {
            intakeId: id,
            answerKey: question.key,
            priorValue: jsonInput(prior.value),
            newValue: jsonInput(candidate.value),
            affectedAreas: affectedAreas(runtime),
            affectedRecordIds: [scope.projectId].filter((recordId): recordId is string => Boolean(recordId)),
            explanation: "A confirmed discovery answer changed. Review affected budgets, deliverables, schedules, and approvals before applying it.",
          },
        });
      }
    }
    const assessment = await refreshDiscoveryState(tx, id);
    await audit(tx, principal, "discovery.answers.saved", id, {
      questionIds: input.answers.map((answer) => answer.questionId),
      readinessStatus: assessment.readinessStatus,
      completeness: assessment.completeness,
    });
    return assessment;
  });
}

export async function assessDiscoverySession(principal: AuthPrincipal, id: string) {
  await scopedIntake(principal, id);
  guard(principal, "production:write");
  return db.$transaction(async (tx) => {
    const assessment = await refreshDiscoveryState(tx, id);
    await audit(tx, principal, "discovery.assessed", id, {
      readinessStatus: assessment.readinessStatus,
      completeness: assessment.completeness,
    });
    return assessment;
  });
}

export async function verifyDiscoveryAnswer(principal: AuthPrincipal, intakeId: string, answerId: string, raw: unknown) {
  await scopedIntake(principal, intakeId);
  guard(principal, "production:write");
  const input = discoveryVerificationSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const answer = await tx.intakeAnswer.findFirst({ where: { id: answerId, intakeId } });
    if (!answer) throw new ServiceError("NOT_FOUND", "Discovery answer not found", 404);
    const updated = await tx.intakeAnswer.update({
      where: { id: answerId },
      data: {
        verificationStatus: input.verificationStatus,
        verifiedById: principal.userId,
        verifiedAt: new Date(),
      },
    });
    await tx.intakeAnswerRevision.create({
      data: {
        answerId,
        version: answer.version + 1,
        value: jsonInput(answer.value),
        source: answer.source,
        sourceReference: answer.sourceReference,
        verificationStatus: input.verificationStatus,
        changedById: principal.userId,
        changeReason: input.reason ?? "Answer verification updated",
      },
    });
    await tx.intakeAnswer.update({ where: { id: answerId }, data: { version: { increment: 1 } } });
    await refreshDiscoveryState(tx, intakeId);
    await audit(tx, principal, "discovery.answer.verified", intakeId, { answerId, verificationStatus: input.verificationStatus });
    return updated;
  });
}

export async function addDiscoveryMaterial(principal: AuthPrincipal, intakeId: string, raw: unknown) {
  const scope = await scopedIntake(principal, intakeId);
  guard(principal, principal.role === "CLIENT" ? "portal:read" : "production:write", {
    organizationId: principal.organizationId,
    clientId: scope.clientId,
    projectId: scope.projectId,
  });
  const input = discoveryMaterialSchema.parse(raw);
  const asset = await db.asset.findFirst({ where: { id: input.assetId, ownerOrganizationId: principal.organizationId } });
  if (!asset) throw new ServiceError("NOT_FOUND", "Uploaded asset not found", 404);
  return db.discoveryMaterial.upsert({
    where: { intakeId_assetId: { intakeId, assetId: input.assetId } },
    update: {
      category: input.category,
      description: input.description,
      extractedData: input.extractedData as Prisma.InputJsonValue | undefined,
      extractionProvider: input.extractionProvider,
      verificationStatus: input.extractedData ? VerificationStatus.UNVERIFIED : undefined,
    },
    create: {
      intakeId,
      assetId: input.assetId,
      category: input.category,
      description: input.description,
      extractedData: input.extractedData as Prisma.InputJsonValue | undefined,
      extractionProvider: input.extractionProvider,
      verificationStatus: VerificationStatus.UNVERIFIED,
    },
  });
}

export async function confirmDiscoveryBrief(principal: AuthPrincipal, intakeId: string, raw: unknown) {
  const scope = await scopedIntake(principal, intakeId);
  guard(principal, principal.role === "CLIENT" ? "portal:read" : "production:write", {
    organizationId: principal.organizationId,
    clientId: scope.clientId,
    projectId: scope.projectId,
  });
  const input = discoveryConfirmationSchema.parse(raw);
  return db.$transaction(async (tx) => {
    await refreshDiscoveryState(tx, intakeId);
    const intake = await tx.intake.findUnique({ where: { id: intakeId } });
    if (!intake || intake.compiledBriefVersion < 1) throw new ServiceError("BRIEF_NOT_READY", "Generate the compiled discovery brief before confirmation", 409);
    const openBlockers = await tx.discoveryRisk.count({ where: { intakeId, blocking: true, resolvedAt: null } });
    if (openBlockers) throw new ServiceError("DISCOVERY_BLOCKED", "Resolve blocking discovery risks before confirmation", 409);
    const confirmation = await tx.discoveryConfirmation.upsert({
      where: { intakeId_briefVersion: { intakeId, briefVersion: intake.compiledBriefVersion } },
      update: {
        confirmedById: principal.userId,
        confirmerName: input.confirmerName,
        confirmerEmail: input.confirmerEmail,
        confirmedAt: new Date(),
        confirmation: input.confirmation,
      },
      create: {
        intakeId,
        briefVersion: intake.compiledBriefVersion,
        confirmedById: principal.userId,
        confirmerName: input.confirmerName,
        confirmerEmail: input.confirmerEmail,
        confirmation: input.confirmation,
      },
    });
    await tx.intake.update({
      where: { id: intakeId },
      data: {
        confirmedBriefVersion: intake.compiledBriefVersion,
        confirmedAt: new Date(),
        confirmedById: principal.userId,
        lockedAt: intake.lockedAt ?? new Date(),
      },
    });
    const source = await discoverySource(tx, intakeId);
    const assessment = assessDiscovery(source.questions, source.answers, {
      briefConfirmed: true,
      finalApproval: ["FINAL_APPROVAL", "AWAITING_FINAL_PAYMENT", "DELIVERY", "COMPLETED"].includes(source.intake.project?.status ?? ""),
      finalPayment: ["DELIVERY", "COMPLETED"].includes(source.intake.project?.status ?? ""),
    });
    await tx.intake.update({
      where: { id: intakeId },
      data: {
        readinessStatus: assessment.readinessStatus,
        readinessAssessedAt: new Date(),
        completeness: assessment.completeness,
      },
    });
    await audit(tx, principal, "discovery.brief.confirmed", intakeId, { briefVersion: intake.compiledBriefVersion });
    return confirmation;
  });
}

export async function addDiscoveryCollaborator(principal: AuthPrincipal, intakeId: string, raw: unknown) {
  await scopedIntake(principal, intakeId);
  guard(principal, "production:write");
  const input = discoveryCollaboratorSchema.parse(raw);
  return db.discoveryCollaborator.upsert({
    where: { intakeId_email: { intakeId, email: input.email } },
    update: { name: input.name, role: input.role, permissions: input.permissions },
    create: { intakeId, ...input, invitedById: principal.userId },
  });
}

export async function reuseVerifiedDiscoveryAnswers(principal: AuthPrincipal, intakeId: string) {
  const scope = await scopedIntake(principal, intakeId);
  guard(principal, "production:write");
  if (!scope.clientId) throw new ServiceError("CLIENT_REQUIRED", "Answer reuse requires a client-linked discovery session", 409);
  return db.$transaction(async (tx) => {
    const current = await discoverySource(tx, intakeId);
    const prior = await tx.intakeAnswer.findMany({
      where: {
        intake: { clientId: scope.clientId, id: { not: intakeId } },
        verificationStatus: { in: [VerificationStatus.CLIENT_CONFIRMED, VerificationStatus.STAFF_VERIFIED] },
      },
      include: { question: { select: { key: true } } },
      orderBy: { updatedAt: "desc" },
    });
    const candidates = reusableAnswers(current.questions, prior.map(runtimeAnswer));
    let reused = 0;
    for (const candidate of candidates) {
      const question = current.questions.find((item) => item.reuseKey === candidate.key || item.key === candidate.key);
      if (!question) continue;
      const exists = await tx.intakeAnswer.count({ where: { intakeId, questionId: question.id } });
      if (exists) continue;
      const answer = await tx.intakeAnswer.create({
        data: {
          intakeId,
          questionId: question.id,
          value: candidate.value as Prisma.InputJsonValue,
          source: AnswerSource.REUSED_VERIFIED_ANSWER,
          sourceReference: "Prior verified discovery session",
          verificationStatus: VerificationStatus.STAFF_VERIFIED,
          verifiedById: principal.userId,
          verifiedAt: new Date(),
          answeredById: principal.userId,
          version: 1,
          isDraft: true,
        },
      });
      await tx.intakeAnswerRevision.create({
        data: {
          answerId: answer.id,
          version: 1,
          value: candidate.value as Prisma.InputJsonValue,
          source: AnswerSource.REUSED_VERIFIED_ANSWER,
          sourceReference: "Prior verified discovery session",
          verificationStatus: VerificationStatus.STAFF_VERIFIED,
          changedById: principal.userId,
          changeReason: "Reused verified answer",
        },
      });
      reused++;
    }
    await refreshDiscoveryState(tx, intakeId);
    await audit(tx, principal, "discovery.answers.reused", intakeId, { reused });
    return { reused };
  });
}

export async function listDiscoveryQuestionBank(principal: AuthPrincipal) {
  guard(principal, "production:read");
  return db.questionnaireDefinition.findMany({
    where: { organizationId: principal.organizationId },
    include: {
      serviceType: true,
      versions: {
        orderBy: { version: "desc" },
        include: {
          sections: {
            orderBy: { sortOrder: "asc" },
            include: { questions: { orderBy: { sortOrder: "asc" }, include: questionInclude } },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function createDiscoveryQuestion(principal: AuthPrincipal, raw: unknown) {
  guard(principal, "settings:write");
  const input = discoveryQuestionSchema.parse(raw);
  const section = await db.questionnaireSection.findFirst({
    where: { id: input.sectionId, version: { definition: { organizationId: principal.organizationId } } },
  });
  if (!section) throw new ServiceError("NOT_FOUND", "Questionnaire section not found", 404);
  return db.$transaction(async (tx) => {
    const question = await tx.questionDefinition.create({
      data: {
        sectionId: input.sectionId,
        key: input.key,
        label: input.label,
        description: input.description,
        helpText: input.helpText,
        type: input.type,
        category: input.category,
        required: input.required,
        recommended: input.recommended,
        internalOnly: input.internalOnly,
        allowsFile: input.allowsFile,
        critical: input.critical,
        active: input.active,
        validation: input.validation as Prisma.InputJsonValue | undefined,
        destination: input.destination as Prisma.InputJsonValue | undefined,
        reuseKey: input.reuseKey,
        clarification: input.clarification as Prisma.InputJsonValue | undefined,
        sortOrder: input.sortOrder,
        conditions: {
          create: input.conditions.map((condition) => ({
            sourceQuestionId: condition.sourceQuestionId,
            operator: condition.operator,
            expectedValue: condition.expectedValue as Prisma.InputJsonValue,
          })),
        },
      },
      include: questionInclude,
    });
    await audit(tx, principal, "discovery.question.created", question.id, { key: question.key });
    return question;
  });
}

export async function updateDiscoveryQuestion(principal: AuthPrincipal, id: string, raw: unknown) {
  guard(principal, "settings:write");
  const input = discoveryQuestionUpdateSchema.parse(raw);
  const existing = await db.questionDefinition.findFirst({
    where: { id, section: { version: { definition: { organizationId: principal.organizationId } } } },
  });
  if (!existing) throw new ServiceError("NOT_FOUND", "Discovery question not found", 404);
  return db.$transaction(async (tx) => {
    if (input.conditions) {
      await tx.questionCondition.deleteMany({ where: { questionId: id } });
    }
    const question = await tx.questionDefinition.update({
      where: { id },
      data: {
        label: input.label,
        description: input.description,
        helpText: input.helpText,
        type: input.type,
        category: input.category,
        required: input.required,
        recommended: input.recommended,
        internalOnly: input.internalOnly,
        allowsFile: input.allowsFile,
        critical: input.critical,
        active: input.active,
        validation: input.validation as Prisma.InputJsonValue | undefined,
        destination: input.destination as Prisma.InputJsonValue | undefined,
        reuseKey: input.reuseKey,
        clarification: input.clarification as Prisma.InputJsonValue | undefined,
        sortOrder: input.sortOrder,
        conditions: input.conditions ? {
          create: input.conditions.map((condition) => ({
            sourceQuestionId: condition.sourceQuestionId,
            operator: condition.operator,
            expectedValue: condition.expectedValue as Prisma.InputJsonValue,
          })),
        } : undefined,
      },
      include: questionInclude,
    });
    await audit(tx, principal, "discovery.question.updated", id, { key: question.key });
    return question;
  });
}

export async function listServiceTypes(principal: AuthPrincipal) {
  guard(principal, "production:read");
  return db.serviceTypeDefinition.findMany({ where: { organizationId: principal.organizationId }, orderBy: { name: "asc" } });
}

export async function createServiceType(principal: AuthPrincipal, raw: unknown) {
  guard(principal, "settings:write");
  const input = serviceTypeDefinitionSchema.parse(raw);
  return db.serviceTypeDefinition.create({
    data: {
      organizationId: principal.organizationId,
      key: input.key,
      name: input.name,
      description: input.description,
      configuration: input.configuration as Prisma.InputJsonValue | undefined,
      active: input.active,
    },
  });
}
