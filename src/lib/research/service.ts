import { Prisma, type ResearchRunStage, type ResearchRunStatus } from "@prisma/client";
import { z } from "zod";
import type { AuthPrincipal } from "@/lib/auth";
import { db } from "@/lib/db";
import { ServiceError } from "@/lib/services/errors";
import { guard } from "@/lib/services/helpers";
import { demoModeEnabled } from "@/lib/demo-mode";
import { assembleGrowth, initialTasks, launchAgent, mergeProfile, pollAgent, type AgentTask } from "./agents";
import { canApproveProfile, emptyProfile, profileProgress, questions, type BusinessProfileData, type GrowthAudit, type ResearchSource } from "./domain";
import { infenergyBaseline, isInfenergyProfile } from "./infenergy-baseline";

const newProfile = z.object({
  businessName: z.string().trim().min(2).max(180),
  description: z.string().trim().min(12).max(5000),
  website: z.union([z.string().url().startsWith("https://"), z.literal("")]).optional(),
  location: z.string().trim().max(200).optional(),
  clientId: z.string().optional(),
});
const reviewAnswerInput = z.object({
  questionId: z.string(),
  value: z.string().trim().min(1).max(8000).nullable(),
  kind: z.enum(["VERIFIED", "INFERRED", "HYPOTHESIS", "UNKNOWN"]),
  sourceUrl: z.string().url().startsWith("https://").optional(),
  sourceType: z.enum(["PUBLIC_WEB", "CLIENT_STATEMENT", "CLIENT_DOCUMENT"]).default("PUBLIC_WEB"),
  sourceTitle: z.string().trim().max(250).optional(),
  rationale: z.string().trim().max(2000).default(""),
  status: z.enum(["DRAFT", "APPROVED", "REJECTED"]).default("APPROVED"),
});
const json = (value: unknown) => value as Prisma.InputJsonValue;
const dataOf = (value: Prisma.JsonValue): BusinessProfileData => value as unknown as BusinessProfileData;
const tasksOf = (value: Prisma.JsonValue): AgentTask[] => value as unknown as AgentTask[];

function internal(principal: AuthPrincipal, write = false) {
  guard(principal, write ? "crm:write" : "crm:read");
}

async function scoped(principal: AuthPrincipal, id: string, write = false) {
  internal(principal, write);
  const profile = await db.businessResearchProfile.findFirst({ where: { id, organizationId: principal.organizationId }, include: { runs: { orderBy: { createdAt: "desc" }, take: 10 } } });
  if (!profile) throw new ServiceError("NOT_FOUND", "Research profile not found", 404);
  return profile;
}

export async function listResearchProfiles(principal: AuthPrincipal) {
  internal(principal);
  const items = await db.businessResearchProfile.findMany({
    where: { organizationId: principal.organizationId },
    orderBy: { updatedAt: "desc" }, take: 100,
    include: { runs: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  return { items: items.map(p => ({ id: p.id, businessName: p.businessName, description: p.description, website: p.website, status: p.status, updatedAt: p.updatedAt, progress: profileProgress(dataOf(p.profileData)), latestRun: p.runs[0] ? { stage: p.runs[0].stage, status: p.runs[0].status } : null })) };
}

export async function createResearchProfile(principal: AuthPrincipal, body: unknown) {
  internal(principal, true);
  const input = newProfile.parse(body);
  if (input.clientId) {
    const client = await db.client.findFirst({ where: { id: input.clientId, organizationId: principal.organizationId }, select: { id: true } });
    if (!client) throw new ServiceError("NOT_FOUND", "Client not found", 404);
  }
  const profile = await db.businessResearchProfile.create({
    data: { organizationId: principal.organizationId, clientId: input.clientId, businessName: input.businessName, description: input.description, website: input.website || null, location: input.location || null, profileData: json(emptyProfile()) },
  });
  // Creation is the user's request to research the company. Queue the first run
  // immediately, but preserve the profile if the provider is not configured.
  try {
    const research = await startResearchRun(principal, profile.id, "PROFILE");
    return { id: profile.id, research };
  } catch (error) {
    return { id: profile.id, research: null, researchError: error instanceof Error ? error.message : "Research could not start" };
  }
}

export async function getResearchProfile(principal: AuthPrincipal, id: string) {
  const p = await scoped(principal, id);
  const data = dataOf(p.profileData);
  return { id: p.id, businessName: p.businessName, description: p.description, website: p.website, location: p.location, clientId: p.clientId, status: p.status, version: p.version, approvedAt: p.approvedAt, researchAvailable: !!process.env.OPENAI_API_KEY && !demoModeEnabled(), researchUnavailableReason: demoModeEnabled() ? "Live research is disabled in demonstration mode." : !process.env.OPENAI_API_KEY ? "Live research needs OPENAI_API_KEY configured on the server." : null, profile: data, progress: profileProgress(data), questions, runs: p.runs.map(r => ({ id: r.id, profileVersion: r.profileVersion, stage: r.stage, status: r.status, tasks: r.tasks, result: r.result, error: r.error, createdAt: r.createdAt, completedAt: r.completedAt })) };
}

export async function applyInfenergyResearchBaseline(principal: AuthPrincipal, id: string) {
  const p = await scoped(principal, id, true);
  if (!isInfenergyProfile(p.businessName, p.website)) throw new ServiceError("NOT_FOUND", "Infenergy research baseline does not apply to this company", 404);
  const data = dataOf(p.profileData);
  if (data.sources.some(source => source.id === "infenergy:about")) return getResearchProfile(principal, id);
  const next = infenergyBaseline(data);
  await db.$transaction([
    db.businessResearchProfile.update({ where: { id }, data: { profileData: json(next), status: "DRAFT", approvedAt: null, approvedBy: null, version: { increment: 1 } } }),
    db.auditEvent.create({ data: { organizationId: principal.organizationId, actorId: principal.userId, action: "research.infenergy.baseline", entityType: "BusinessResearchProfile", entityId: id, after: json({ answered: profileProgress(next).answered, sourceCount: next.sources.length }) } }),
  ]);
  return getResearchProfile(principal, id);
}

export async function reviewResearchAnswer(principal: AuthPrincipal, id: string, body: unknown) {
  const p = await scoped(principal, id, true);
  const input = reviewAnswerInput.parse(body);
  if (!questions.some(q => q.id === input.questionId)) throw new ServiceError("VALIDATION_ERROR", "Unknown questionnaire field", 400);
  if ((input.kind === "UNKNOWN") !== (input.value === null)) throw new ServiceError("VALIDATION_ERROR", "Unknown answers require null; other answers require a value", 400);
  if (input.status === "APPROVED" && input.kind === "INFERRED" && !input.rationale) throw new ServiceError("VALIDATION_ERROR", "An inference needs a rationale", 400);
  const data = dataOf(p.profileData);
  const prior = data.answers.find(a => a.questionId === input.questionId);
  if (input.status === "APPROVED" && input.kind === "VERIFIED" && !input.sourceUrl && !prior?.sourceIds.length && !(input.sourceType !== "PUBLIC_WEB" && input.sourceTitle)) throw new ServiceError("VALIDATION_ERROR", "Provide a source URL or a titled client source", 400);
  const source: ResearchSource | null = input.sourceUrl || (input.sourceType !== "PUBLIC_WEB" && input.sourceTitle) ? {
    id: `manual-${crypto.randomUUID()}`, url: input.sourceUrl || `internal:${id}:${crypto.randomUUID()}`,
    title: input.sourceTitle || "Reviewed source", capturedAt: new Date().toISOString(), type: input.sourceType,
  } : null;
  const sourceIds = source ? [source.id] : prior?.sourceIds || [];
  if (input.status === "APPROVED" && input.value && !sourceIds.length) throw new ServiceError("VALIDATION_ERROR", "Approved answers need a source", 400);
  data.sources = source ? [...data.sources, source] : data.sources;
  data.answers = data.answers.map(a => a.questionId === input.questionId ? {
    questionId: input.questionId, value: input.value, kind: input.kind,
    sourceIds, confidence: input.status === "APPROVED" ? 1 : prior?.confidence || 0,
    rationale: input.rationale || prior?.rationale || "",
    status: input.status, reviewedBy: input.status === "APPROVED" ? principal.userId : undefined,
    reviewedAt: input.status === "APPROVED" ? new Date().toISOString() : undefined,
  } : a);
  await db.$transaction([
    db.businessResearchProfile.update({ where: { id }, data: { profileData: json(data), status: "DRAFT", approvedAt: null, approvedBy: null, version: { increment: 1 } } }),
    db.auditEvent.create({ data: { organizationId: principal.organizationId, actorId: principal.userId, action: "research.answer.review", entityType: "BusinessResearchProfile", entityId: id, before: prior ? json(prior) : Prisma.JsonNull, after: json({ questionId: input.questionId, kind: input.kind, status: input.status }) } }),
  ]);
  return getResearchProfile(principal, id);
}

export async function approveResearchProfile(principal: AuthPrincipal, id: string) {
  const p = await scoped(principal, id, true);
  const check = canApproveProfile(dataOf(p.profileData));
  if (!check.ready) throw new ServiceError("NOT_READY", "Review the sourced business facts before approval", 409, check.errors);
  await db.$transaction([
    db.businessResearchProfile.update({ where: { id }, data: { status: "APPROVED", approvedAt: new Date(), approvedBy: principal.userId } }),
    db.auditEvent.create({ data: { organizationId: principal.organizationId, actorId: principal.userId, action: "research.profile.approve", entityType: "BusinessResearchProfile", entityId: id, after: json({ version: p.version }) } }),
  ]);
  return { id, status: "APPROVED", version: p.version };
}

export async function startResearchRun(principal: AuthPrincipal, id: string, stage: ResearchRunStage) {
  const p = await scoped(principal, id, true);
  if (demoModeEnabled()) throw new ServiceError("RESEARCH_DISABLED_IN_DEMO", "Live paid research is disabled in the public demonstration workspace", 403);
  if (!process.env.OPENAI_API_KEY) throw new ServiceError("PROVIDER_UNAVAILABLE", "Configure OPENAI_API_KEY to run live research", 503);
  if (stage === "GROWTH" && p.status !== "APPROVED") {
    const completedProfileResearch = await db.businessResearchRun.findFirst({ where: { profileId: id, stage: "PROFILE", status: { in: ["READY", "PARTIAL"] } }, select: { id: true } });
    if (!completedProfileResearch || !profileProgress(dataOf(p.profileData)).answered) throw new ServiceError("PROFILE_RESEARCH_REQUIRED", "Complete company research before starting the growth audit", 409);
  }
  const active = await db.businessResearchRun.findFirst({ where: { profileId: id, stage, status: { in: ["QUEUED", "RUNNING"] } }, orderBy: { createdAt: "desc" } });
  if (active) return { id: active.id, status: active.status };
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const dailyRuns = await db.businessResearchRun.count({ where: { profile: { organizationId: principal.organizationId }, createdAt: { gte: today } } });
  if (dailyRuns >= 8) throw new ServiceError("RESEARCH_LIMIT", "Daily research limit reached; try again tomorrow", 429);
  const run = await db.businessResearchRun.create({ data: { profileId: id, profileVersion: p.version, stage, tasks: json(initialTasks(stage)) } });
  return { id: run.id, status: run.status };
}

export async function advanceResearchRun(runId: string): Promise<{ id: string; status: ResearchRunStatus; tasks: AgentTask[] }> {
  const run = await db.businessResearchRun.findUnique({ where: { id: runId }, include: { profile: true } });
  if (!run) throw new ServiceError("NOT_FOUND", "Research run not found", 404);
  if (["READY", "PARTIAL", "FAILED"].includes(run.status)) return { id: run.id, status: run.status, tasks: tasksOf(run.tasks) };
  const stage = run.stage;
  let tasks = tasksOf(run.tasks);
  if (run.status === "QUEUED") {
    const lease = await db.businessResearchRun.updateMany({ where: { id: runId, status: "QUEUED" }, data: { status: "RUNNING", startedAt: new Date(), leaseUntil: new Date(Date.now() + 90000) } });
    if (!lease.count) return { id: runId, status: "RUNNING", tasks };
    const started = await Promise.allSettled(tasks.map(t => launchAgent(stage, t.lane, run.profile)));
    tasks = tasks.map((t, i): AgentTask => {
      const item = started[i];
      return item.status === "fulfilled"
        ? { ...t, status: "RUNNING", responseId: item.value }
        : { ...t, status: "FAILED", error: String(item.reason).slice(0, 300) };
    });
  } else {
    const lease = await db.businessResearchRun.updateMany({
      where: { id: runId, status: "RUNNING", OR: [{ leaseUntil: null }, { leaseUntil: { lt: new Date() } }] },
      data: { leaseUntil: new Date(Date.now() + 90000) },
    });
    if (!lease.count) return { id: runId, status: "RUNNING", tasks };
    const polled = await Promise.allSettled(tasks.map(t => t.status === "RUNNING" && t.responseId ? pollAgent(t.responseId) : Promise.resolve(null)));
    tasks = tasks.map((t, i): AgentTask => {
      if (t.status !== "RUNNING") return t;
      const item = polled[i];
      if (item.status === "rejected") return { ...t, status: "FAILED", error: String(item.reason).slice(0, 300) };
      const next = item.value;
      if (!next || next.status === "RUNNING") return t;
      return next.status === "COMPLETE" ? { ...t, status: "COMPLETE", result: next.result, sources: next.sources } : { ...t, status: "FAILED", error: next.error };
    });
  }
  const done = tasks.every(t => t.status === "COMPLETE" || t.status === "FAILED");
  const status: ResearchRunStatus = !done ? "RUNNING" : tasks.some(t => t.status === "COMPLETE") ? tasks.some(t => t.status === "FAILED") ? "PARTIAL" : "READY" : "FAILED";
  const sourceList = tasks.flatMap(t => t.sources || []);
  const result = done && stage === "GROWTH" ? assembleGrowth(tasks, sourceList) : null;
  await db.$transaction(async tx => {
    await tx.businessResearchRun.update({ where: { id: runId }, data: { tasks: json(tasks), status, leaseUntil: null, completedAt: done ? new Date() : null, result: result ? json(result) : undefined, error: status === "FAILED" ? tasks.map(t => t.error).filter(Boolean).join("; ") : null } });
    if (done && stage === "PROFILE" && tasks.some(t => t.status === "COMPLETE")) {
      const current = await tx.businessResearchProfile.findUniqueOrThrow({ where: { id: run.profileId } });
      await tx.businessResearchProfile.update({ where: { id: run.profileId }, data: {
        profileData: json(mergeProfile(dataOf(current.profileData), tasks, sourceList)),
        status: "DRAFT", approvedAt: null, approvedBy: null, version: { increment: 1 },
      } });
    }
  });
  return { id: runId, status, tasks };
}

export async function advanceScopedRun(principal: AuthPrincipal, profileId: string, runId: string) {
  const p = await scoped(principal, profileId, true);
  if (!p.runs.some(r => r.id === runId)) throw new ServiceError("NOT_FOUND", "Research run not found", 404);
  return advanceResearchRun(runId);
}

export async function processResearchQueue(limit = 2) {
  const rows = await db.businessResearchRun.findMany({ where: { status: { in: ["QUEUED", "RUNNING"] } }, orderBy: { updatedAt: "asc" }, take: Math.min(Math.max(limit, 1), 5), select: { id: true } });
  return Promise.all(rows.map(row => advanceResearchRun(row.id).catch(error => ({ id: row.id, status: "FAILED" as const, error: String(error) }))));
}

export async function reviewGrowthOpportunity(principal: AuthPrincipal, profileId: string, runId: string, body: unknown) {
  const p = await scoped(principal, profileId, true);
  const run = await db.businessResearchRun.findFirst({ where: { id: runId, profileId: p.id, stage: "GROWTH" } });
  if (!run?.result) throw new ServiceError("NOT_FOUND", "Growth audit not found", 404);
  if (run.profileVersion !== p.version) throw new ServiceError("STALE_PROFILE", "The company profile changed. Rerun growth intelligence before approving opportunities", 409);
  const input = z.object({ opportunityId: z.string(), status: z.enum(["APPROVED", "REJECTED", "DRAFT"]) }).parse(body);
  const audit = run.result as unknown as GrowthAudit;
  const target = audit.opportunities.find(o => o.id === input.opportunityId);
  if (!target) throw new ServiceError("NOT_FOUND", "Opportunity not found", 404);
  audit.opportunities = audit.opportunities.map(o => o.id === target.id ? { ...o, status: input.status } : o);
  await db.$transaction([
    db.businessResearchRun.update({ where: { id: runId }, data: { result: json(audit) } }),
    db.auditEvent.create({ data: { organizationId: principal.organizationId, actorId: principal.userId, action: "research.opportunity.review", entityType: "BusinessResearchRun", entityId: runId, after: json(input) } }),
  ]);
  return { id: target.id, status: input.status };
}

