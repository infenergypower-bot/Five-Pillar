import type {
  AnswerSource,
  DiscoveryOutputType,
  DiscoveryReadinessStatus,
  DiscoveryRiskSeverity,
  VerificationStatus,
} from "@prisma/client";

export interface DiscoveryCondition {
  operator: string;
  sourceKey: string;
  expectedValue: unknown;
}

export interface DiscoveryQuestion {
  id: string;
  key: string;
  label: string;
  category: string;
  type: string;
  required: boolean;
  recommended: boolean;
  critical: boolean;
  active: boolean;
  reuseKey?: string | null;
  validation?: Record<string, unknown> | null;
  destination?: Record<string, unknown> | null;
  conditions: DiscoveryCondition[];
}

export interface DiscoveryAnswer {
  questionId?: string;
  key: string;
  value: unknown;
  source: AnswerSource;
  verificationStatus: VerificationStatus;
  version?: number;
}

export interface ClarificationRecommendation {
  questionKey: string;
  reasonCode: string;
  prompt: string;
  rationale: string;
  origin: AnswerSource;
}

export interface DiscoveryRiskFinding {
  code: string;
  title: string;
  description: string;
  severity: DiscoveryRiskSeverity;
  category: string;
  blocking: boolean;
  evidence?: Record<string, unknown>;
}

export interface DiscoveryOutputPayload {
  type: DiscoveryOutputType;
  payload: Record<string, unknown>;
  sourceAnswerKeys: string[];
  targetType: string;
}

export interface DiscoveryAssessment {
  visibleQuestions: DiscoveryQuestion[];
  missingRequired: DiscoveryQuestion[];
  missingRecommended: DiscoveryQuestion[];
  unverifiedCritical: DiscoveryQuestion[];
  clarifications: ClarificationRecommendation[];
  risks: DiscoveryRiskFinding[];
  readinessStatus: DiscoveryReadinessStatus;
  completeness: number;
  readyForPreliminaryEstimate: boolean;
  readyForFirmQuotation: boolean;
  readyForProduction: boolean;
}

function populated(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

function comparable(value: unknown): unknown {
  return typeof value === "string" ? value.trim().toLowerCase() : value;
}

export function conditionMatches(condition: DiscoveryCondition, answers: ReadonlyMap<string, DiscoveryAnswer>): boolean {
  const actual = answers.get(condition.sourceKey)?.value;
  const expected = condition.expectedValue;
  switch (condition.operator.toUpperCase()) {
    case "EQUALS":
      return comparable(actual) === comparable(expected);
    case "NOT_EQUALS":
      return comparable(actual) !== comparable(expected);
    case "CONTAINS":
      return Array.isArray(actual)
        ? actual.some((item) => comparable(item) === comparable(expected))
        : String(actual ?? "").toLowerCase().includes(String(expected ?? "").toLowerCase());
    case "NOT_CONTAINS":
      return !conditionMatches({ ...condition, operator: "CONTAINS" }, answers);
    case "IN":
      return Array.isArray(expected) && (Array.isArray(actual)
        ? actual.some((actualItem) => expected.some((expectedItem) => comparable(expectedItem) === comparable(actualItem)))
        : expected.some((item) => comparable(item) === comparable(actual)));
    case "GREATER_THAN":
      return Number(actual) > Number(expected);
    case "LESS_THAN":
      return Number(actual) < Number(expected);
    case "IS_TRUE":
      return actual === true;
    case "IS_FALSE":
      return actual === false;
    case "IS_ANSWERED":
      return populated(actual);
    case "IS_NOT_ANSWERED":
      return !populated(actual);
    default:
      return false;
  }
}

export function visibleDiscoveryQuestions(
  questions: readonly DiscoveryQuestion[],
  answers: readonly DiscoveryAnswer[],
): DiscoveryQuestion[] {
  const answerMap = new Map(answers.map((answer) => [answer.key, answer]));
  return questions
    .filter((question) => question.active && question.conditions.every((condition) => conditionMatches(condition, answerMap)))
    .sort((left, right) => left.category.localeCompare(right.category) || left.label.localeCompare(right.label));
}

function minLength(question: DiscoveryQuestion): number {
  const configured = question.validation?.minLength;
  return typeof configured === "number" ? configured : question.type === "LONG_TEXT" ? 20 : 1;
}

export function recommendClarifications(
  questions: readonly DiscoveryQuestion[],
  answers: readonly DiscoveryAnswer[],
): ClarificationRecommendation[] {
  const answerMap = new Map(answers.map((answer) => [answer.key, answer]));
  const recommendations: ClarificationRecommendation[] = [];
  const vague = /^(?:n\/?a|not sure|unknown|whatever|anything|tbd|asap|soon|make it pop)$/i;

  for (const question of questions) {
    const answer = answerMap.get(question.key);
    if (!answer || !populated(answer.value)) continue;
    if (typeof answer.value === "string" && (vague.test(answer.value.trim()) || answer.value.trim().length < minLength(question))) {
      recommendations.push({
        questionKey: question.key,
        reasonCode: "AMBIGUOUS_ANSWER",
        prompt: `Please add specific details for "${question.label}".`,
        rationale: "The current answer is too ambiguous to support reliable planning or estimation.",
        origin: "AI_RECOMMENDATION",
      });
    }
  }

  const audience = answerMap.get("target_audience")?.value;
  const channels = answerMap.get("marketing_channels")?.value;
  if (populated(channels) && !populated(audience)) {
    recommendations.push({
      questionKey: "target_audience",
      reasonCode: "MISSING_CONTEXT",
      prompt: "Who specifically should this campaign reach, and what action should they take?",
      rationale: "Channel selection without an audience definition cannot produce a defensible content strategy.",
      origin: "AI_RECOMMENDATION",
    });
  }

  const narration = answerMap.get("narrator_required")?.value;
  const voice = answerMap.get("voice_direction")?.value;
  if (narration === true && !populated(voice)) {
    recommendations.push({
      questionKey: "voice_direction",
      reasonCode: "DEPENDENT_DETAIL_MISSING",
      prompt: "Describe the narrator voice, tone, accent, language, and any casting restrictions.",
      rationale: "Narration was requested without enough direction to estimate casting or generation.",
      origin: "AI_RECOMMENDATION",
    });
  }

  return recommendations;
}

function dateValue(value: unknown): Date | null {
  if (typeof value !== "string" && !(value instanceof Date)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function identifyDiscoveryRisks(
  answers: readonly DiscoveryAnswer[],
  now = new Date(),
): DiscoveryRiskFinding[] {
  const map = new Map(answers.map((answer) => [answer.key, answer]));
  const findings: DiscoveryRiskFinding[] = [];
  const deadline = dateValue(map.get("deadline")?.value);
  if (deadline) {
    const days = Math.ceil((deadline.getTime() - now.getTime()) / 86_400_000);
    if (days < 0) findings.push({ code: "DEADLINE_PASSED", title: "Deadline has passed", description: "The requested delivery date is already in the past.", severity: "BLOCKING", category: "SCHEDULE", blocking: true, evidence: { days } });
    else if (days < 14) findings.push({ code: "UNREALISTIC_DEADLINE", title: "Accelerated deadline", description: "The requested deadline is less than fourteen days away and requires schedule review.", severity: "HIGH", category: "SCHEDULE", blocking: false, evidence: { days } });
  }

  const budget = Number(map.get("budget_range")?.value);
  const runtime = Number(map.get("runtime_minutes")?.value);
  const scenes = Number(map.get("scene_count")?.value);
  if (Number.isFinite(budget) && budget > 0 && ((runtime > 5 && budget < 5000) || (scenes > 10 && budget < 5000))) {
    findings.push({ code: "INSUFFICIENT_BUDGET", title: "Budget may not support scope", description: "The stated budget is low for the requested runtime or scene count.", severity: "HIGH", category: "BUDGET", blocking: false, evidence: { budget, runtime, scenes } });
  }

  if (map.get("uses_third_party_material")?.value === true && !["STAFF_VERIFIED", "CLIENT_CONFIRMED"].includes(map.get("rights_status")?.verificationStatus ?? "")) {
    findings.push({ code: "UNVERIFIED_RIGHTS", title: "Usage rights are unverified", description: "Third-party material cannot enter production until ownership or permission is verified.", severity: "BLOCKING", category: "RIGHTS", blocking: true });
  }
  if (map.get("product_claims_required")?.value === true && map.get("claim_evidence_available")?.value !== true) {
    findings.push({ code: "UNSUPPORTED_PRODUCT_CLAIMS", title: "Product claims need evidence", description: "Requested claims are not supported by approved source material.", severity: "BLOCKING", category: "LEGAL", blocking: true });
  }
  const approvers = map.get("stakeholder_approvers")?.value;
  if (Array.isArray(approvers) && approvers.length > 1 && !populated(map.get("approval_workflow")?.value)) {
    findings.push({ code: "CONFLICTING_APPROVALS", title: "Approval authority is unclear", description: "Multiple stakeholders are listed without a final decision-maker or escalation path.", severity: "HIGH", category: "APPROVALS", blocking: true });
  }
  if (map.get("required_assets_complete")?.value === false) {
    findings.push({ code: "MISSING_ASSETS", title: "Required assets are missing", description: "Production cannot begin until the identified source materials are supplied and cleared.", severity: "HIGH", category: "ASSETS", blocking: true });
  }
  return findings;
}

function verified(answer: DiscoveryAnswer | undefined): boolean {
  return Boolean(answer && ["CLIENT_CONFIRMED", "STAFF_VERIFIED"].includes(answer.verificationStatus));
}

export function assessDiscovery(
  questions: readonly DiscoveryQuestion[],
  answers: readonly DiscoveryAnswer[],
  options: { briefConfirmed?: boolean; finalApproval?: boolean; finalPayment?: boolean; now?: Date } = {},
): DiscoveryAssessment {
  const visibleQuestions = visibleDiscoveryQuestions(questions, answers);
  const answerMap = new Map(answers.map((answer) => [answer.key, answer]));
  const missingRequired = visibleQuestions.filter((question) => question.required && !populated(answerMap.get(question.key)?.value));
  const missingRecommended = visibleQuestions.filter((question) => question.recommended && !populated(answerMap.get(question.key)?.value));
  const unverifiedCritical = visibleQuestions.filter((question) => question.critical && populated(answerMap.get(question.key)?.value) && !verified(answerMap.get(question.key)));
  const clarifications = recommendClarifications(visibleQuestions, answers);
  const risks = identifyDiscoveryRisks(answers, options.now);
  const blockingRisks = risks.filter((risk) => risk.blocking);
  const requiredCount = visibleQuestions.filter((question) => question.required).length;
  const completeness = requiredCount === 0 ? 100 : Math.round(((requiredCount - missingRequired.length) / requiredCount) * 100);
  const readyForPreliminaryEstimate = missingRequired.length === 0;
  const quotationKeys = ["budget_range", "deadline", "deliverables", "approval_workflow"];
  const readyForFirmQuotation = readyForPreliminaryEstimate
    && quotationKeys.every((key) => populated(answerMap.get(key)?.value))
    && clarifications.length === 0
    && blockingRisks.length === 0
    && unverifiedCritical.length === 0;
  const readyForProduction = readyForFirmQuotation
    && unverifiedCritical.length === 0
    && blockingRisks.length === 0
    && options.briefConfirmed === true;

  let readinessStatus: DiscoveryReadinessStatus = "DISCOVERY_INCOMPLETE";
  if (missingRequired.length === 0 && (clarifications.length > 0 || blockingRisks.length > 0)) readinessStatus = "CLARIFICATION_REQUIRED";
  else if (readyForPreliminaryEstimate) readinessStatus = "READY_FOR_PRELIMINARY_ESTIMATE";
  if (readyForFirmQuotation) readinessStatus = "READY_FOR_FIRM_QUOTATION";
  if (readyForFirmQuotation && options.briefConfirmed) readinessStatus = "READY_FOR_CREATIVE_DEVELOPMENT";
  if (readyForProduction) readinessStatus = "READY_FOR_PRODUCTION";
  if (readyForProduction && options.finalApproval && options.finalPayment) readinessStatus = "READY_FOR_FINAL_DELIVERY";

  return {
    visibleQuestions,
    missingRequired,
    missingRecommended,
    unverifiedCritical,
    clarifications,
    risks,
    readinessStatus,
    completeness,
    readyForPreliminaryEstimate,
    readyForFirmQuotation,
    readyForProduction,
  };
}

function selectedVerifiedAnswers(answers: readonly DiscoveryAnswer[]): Record<string, unknown> {
  return Object.fromEntries(answers.filter((answer) => verified(answer)).map((answer) => [answer.key, answer.value]));
}

function pick(source: Record<string, unknown>, keys: readonly string[]): Record<string, unknown> {
  return Object.fromEntries(keys.flatMap((key) => populated(source[key]) ? [[key, source[key]]] : []));
}

export function generateDiscoveryOutputs(
  answers: readonly DiscoveryAnswer[],
  servicePath: string,
  assessment: DiscoveryAssessment,
): DiscoveryOutputPayload[] {
  const source = selectedVerifiedAnswers(answers);
  const output = (
    type: DiscoveryOutputType,
    keys: string[],
    targetType: string,
    extra: Record<string, unknown> = {},
  ): DiscoveryOutputPayload => ({ type, payload: { ...pick(source, keys), ...extra }, sourceAnswerKeys: keys.filter((key) => populated(source[key])), targetType });

  const results: DiscoveryOutputPayload[] = [
    output("CLIENT_BUSINESS_PROFILE", ["business_name", "business_model", "industry", "website", "primary_objective"], "Client"),
    output("BRAND_INTELLIGENCE_PROFILE", ["brand_voice", "brand_values", "visual_identity", "competitors", "product_positioning"], "Brand"),
    output("TARGET_AUDIENCE_PROFILE", ["target_audience", "audience_pain_points", "audience_action", "audience_locations"], "Client"),
    output("CREATIVE_DIRECTION_BRIEF", ["primary_objective", "visual_style", "tone", "references", "brand_voice"], "ProductionBrief"),
    output("TECHNICAL_PRODUCTION_SPECIFICATION", ["deliverables", "aspect_ratios", "platforms", "resolution", "runtime_minutes", "soundtrack", "captions"], "ProductionBrief"),
    output("PRELIMINARY_PRICING_ESTIMATE", ["budget_range", "deadline", "scene_count", "runtime_minutes", "content_volume"], "Quote", { estimateReady: assessment.readyForPreliminaryEstimate }),
    output("PRODUCTION_READINESS_CHECKLIST", [], "Project", {
      status: assessment.readinessStatus,
      missingRequired: assessment.missingRequired.map((question) => question.key),
      unverifiedCritical: assessment.unverifiedCritical.map((question) => question.key),
      blockingRisks: assessment.risks.filter((risk) => risk.blocking).map((risk) => risk.code),
    }),
  ];

  if (["VISUAL_PRODUCTION", "COMBINED", "ORIGINAL_ENTERTAINMENT"].includes(servicePath)) {
    results.push(
      output("SCRIPT_DEVELOPMENT_BRIEF", ["premise", "logline", "screenplay_status", "dialogue", "narrator_required", "voice_direction"], "ProductionBrief"),
      output("CHARACTER_ENVIRONMENT_REQUIREMENTS", ["characters", "character_identity", "worldbuilding", "locations", "props", "product_accuracy"], "ProductionBrief"),
      output("SHOT_SCENE_ESTIMATE", ["scene_count", "locations", "characters", "runtime_minutes", "production_complexity"], "Project"),
      output("LABOR_ESTIMATE", ["scene_count", "runtime_minutes", "production_complexity", "revision_rounds"], "Quote"),
      output("AI_GENERATION_REQUIREMENTS", ["visual_style", "scene_count", "characters", "locations", "aspect_ratios"], "Project"),
    );
  }
  if (["MANAGED_MARKETING", "COMBINED"].includes(servicePath)) {
    results.push(output("ALPHI_INTEGRATION_PAYLOAD", ["business_name", "target_audience", "brand_voice", "marketing_channels", "campaign_objectives", "content_volume", "approval_workflow"], "IntegrationOutbox"));
  }
  return results;
}

export function reusableAnswers(
  questions: readonly DiscoveryQuestion[],
  priorAnswers: readonly DiscoveryAnswer[],
): DiscoveryAnswer[] {
  const reusableKeys = new Set(questions.flatMap((question) => question.reuseKey ? [question.reuseKey] : []));
  return priorAnswers
    .filter((answer) => reusableKeys.has(answer.key) && verified(answer))
    .map((answer) => ({ ...answer, source: "REUSED_VERIFIED_ANSWER", verificationStatus: "STAFF_VERIFIED" }));
}

export function affectedAreas(question: DiscoveryQuestion): string[] {
  const configured = question.destination?.affectedAreas;
  if (Array.isArray(configured)) return configured.map(String);
  const category = question.category.toUpperCase();
  if (["BUDGET", "FINANCIAL"].includes(category)) return ["BUDGET", "QUOTE", "APPROVALS"];
  if (["TECHNICAL", "PRODUCTION", "DELIVERABLES"].includes(category)) return ["DELIVERABLES", "SCHEDULE", "PRODUCTION_PLAN", "QUOTE"];
  if (["RIGHTS", "LEGAL"].includes(category)) return ["RIGHTS", "APPROVALS", "PRODUCTION_GATE"];
  return ["DISCOVERY_BRIEF"];
}
