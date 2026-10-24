import { describe, expect, it } from "vitest";
import {
  affectedAreas,
  assessDiscovery,
  generateDiscoveryOutputs,
  identifyDiscoveryRisks,
  reusableAnswers,
  visibleDiscoveryQuestions,
  type DiscoveryAnswer,
  type DiscoveryQuestion,
} from "./discovery";

const questions: DiscoveryQuestion[] = [
  {
    id: "objective",
    key: "primary_objective",
    label: "Primary objective",
    category: "BUSINESS",
    type: "LONG_TEXT",
    required: true,
    recommended: false,
    critical: false,
    active: true,
    reuseKey: "primary_objective",
    validation: { minLength: 10 },
    destination: { affectedAreas: ["DISCOVERY_BRIEF", "QUOTE"] },
    conditions: [],
  },
  {
    id: "channels",
    key: "marketing_channels",
    label: "Marketing channels",
    category: "MARKETING",
    type: "MULTI_SELECT",
    required: true,
    recommended: false,
    critical: false,
    active: true,
    conditions: [{ sourceKey: "service_path", operator: "CONTAINS", expectedValue: "MANAGED_MARKETING" }],
  },
  {
    id: "rights",
    key: "rights_status",
    label: "Rights status",
    category: "RIGHTS",
    type: "SINGLE_SELECT",
    required: true,
    recommended: false,
    critical: true,
    active: true,
    conditions: [{ sourceKey: "uses_third_party_material", operator: "IS_TRUE", expectedValue: true }],
  },
  ...["budget_range", "deadline", "deliverables", "approval_workflow"].map((key) => ({
    id: key,
    key,
    label: key,
    category: key === "budget_range" ? "BUDGET" : "PRODUCTION",
    type: "SHORT_TEXT",
    required: true,
    recommended: false,
    critical: false,
    active: true,
    conditions: [],
  } satisfies DiscoveryQuestion)),
];

function answer(
  key: string,
  value: unknown,
  verificationStatus: DiscoveryAnswer["verificationStatus"] = "STAFF_VERIFIED",
): DiscoveryAnswer {
  return { key, value, source: "AUTHORIZED_STAFF", verificationStatus };
}

describe("intelligent adaptive discovery", () => {
  it("shows only questions activated by prior answers", () => {
    expect(visibleDiscoveryQuestions(questions, [answer("service_path", ["VISUAL_PRODUCTION"])]).map((item) => item.key)).not.toContain("marketing_channels");
    expect(visibleDiscoveryQuestions(questions, [answer("service_path", ["MANAGED_MARKETING"])]).map((item) => item.key)).toContain("marketing_channels");
  });

  it("enforces deterministic missing-information checks", () => {
    const assessment = assessDiscovery(questions, []);
    expect(assessment.readinessStatus).toBe("DISCOVERY_INCOMPLETE");
    expect(assessment.missingRequired.map((item) => item.key)).toContain("primary_objective");
    expect(assessment.readyForPreliminaryEstimate).toBe(false);
  });

  it("requires clarification for ambiguous answers", () => {
    const answers = [
      answer("primary_objective", "Make it pop"),
      answer("budget_range", "8000"),
      answer("deadline", "2027-02-01"),
      answer("deliverables", "One commercial"),
      answer("approval_workflow", "Founder approves"),
    ];
    const assessment = assessDiscovery(questions, answers, { now: new Date("2026-10-24") });
    expect(assessment.readinessStatus).toBe("CLARIFICATION_REQUIRED");
    expect(assessment.clarifications.some((item) => item.reasonCode === "AMBIGUOUS_ANSWER")).toBe(true);
  });

  it("reuses only previously verified answers", () => {
    const reused = reusableAnswers(questions, [
      answer("primary_objective", "Grow qualified demand through a product launch.", "CLIENT_CONFIRMED"),
      answer("primary_objective", "Unverified replacement", "UNVERIFIED"),
      answer("unrelated", "Do not copy"),
    ]);
    expect(reused).toHaveLength(1);
    expect(reused[0]).toMatchObject({ key: "primary_objective", source: "REUSED_VERIFIED_ANSWER" });
  });

  it("blocks production when critical answers are unverified", () => {
    const rightsQuestion = questions.find((item) => item.key === "rights_status");
    expect(rightsQuestion).toBeDefined();
    const answers = [
      answer("uses_third_party_material", true),
      answer("rights_status", "Licensed", "UNVERIFIED"),
      answer("primary_objective", "Launch the approved product campaign."),
      answer("budget_range", "8000"),
      answer("deadline", "2027-02-01"),
      answer("deliverables", "One commercial"),
      answer("approval_workflow", "Founder approves"),
    ];
    const assessment = assessDiscovery(questions, answers, { briefConfirmed: true, now: new Date("2026-10-24") });
    expect(assessment.unverifiedCritical.map((item) => item.key)).toContain("rights_status");
    expect(assessment.readyForProduction).toBe(false);
  });

  it("detects deadline, budget, rights, claims, approvals, and asset risks", () => {
    const risks = identifyDiscoveryRisks([
      answer("deadline", "2026-10-28"),
      answer("budget_range", 1000),
      answer("runtime_minutes", 12),
      answer("uses_third_party_material", true),
      answer("rights_status", "Unknown", "UNVERIFIED"),
      answer("product_claims_required", true),
      answer("claim_evidence_available", false),
      answer("stakeholder_approvers", ["Legal", "Marketing"]),
      answer("required_assets_complete", false),
    ], new Date("2026-10-24"));
    expect(risks.map((risk) => risk.code)).toEqual(expect.arrayContaining([
      "UNREALISTIC_DEADLINE",
      "INSUFFICIENT_BUDGET",
      "UNVERIFIED_RIGHTS",
      "UNSUPPORTED_PRODUCT_CLAIMS",
      "CONFLICTING_APPROVALS",
      "MISSING_ASSETS",
    ]));
  });

  it("advances through quotation and production readiness gates", () => {
    const answers = [
      answer("primary_objective", "Launch a verified national product campaign."),
      answer("budget_range", "12000"),
      answer("deadline", "2027-03-01"),
      answer("deliverables", "One master and three cutdowns"),
      answer("approval_workflow", "Founder has final authority"),
    ];
    const quotation = assessDiscovery(questions, answers, { now: new Date("2026-10-24") });
    const production = assessDiscovery(questions, answers, { briefConfirmed: true, now: new Date("2026-10-24") });
    const delivery = assessDiscovery(questions, answers, { briefConfirmed: true, finalApproval: true, finalPayment: true, now: new Date("2026-10-24") });
    expect(quotation.readinessStatus).toBe("READY_FOR_FIRM_QUOTATION");
    expect(production.readinessStatus).toBe("READY_FOR_PRODUCTION");
    expect(delivery.readinessStatus).toBe("READY_FOR_FINAL_DELIVERY");
  });

  it("generates structured downstream records from verified answers", () => {
    const answers = [
      answer("business_name", "Atlas Outdoor"),
      answer("primary_objective", "Launch the Summit bottle."),
      answer("target_audience", "Outdoor enthusiasts"),
      answer("visual_style", "Cinematic mountain sunrise"),
      answer("scene_count", 6),
      answer("budget_range", 12000),
      answer("deadline", "2027-03-01"),
      answer("deliverables", ["Master", "Cutdowns"]),
      answer("approval_workflow", "Founder approval"),
      answer("marketing_channels", ["Instagram"]),
      answer("brand_voice", "Confident and practical"),
    ];
    const assessment = assessDiscovery(questions, answers, { now: new Date("2026-10-24") });
    const outputs = generateDiscoveryOutputs(answers, "COMBINED", assessment);
    expect(outputs.map((item) => item.type)).toEqual(expect.arrayContaining([
      "CLIENT_BUSINESS_PROFILE",
      "CREATIVE_DIRECTION_BRIEF",
      "TECHNICAL_PRODUCTION_SPECIFICATION",
      "SHOT_SCENE_ESTIMATE",
      "LABOR_ESTIMATE",
      "ALPHI_INTEGRATION_PAYLOAD",
    ]));
  });

  it("does not put unverified answers into generated profiles", () => {
    const assessment = assessDiscovery([], []);
    const outputs = generateDiscoveryOutputs([
      answer("business_name", "Verified Client"),
      answer("industry", "Unverified industry", "UNVERIFIED"),
    ], "CUSTOM", assessment);
    const profile = outputs.find((item) => item.type === "CLIENT_BUSINESS_PROFILE");
    expect(profile?.payload).toMatchObject({ business_name: "Verified Client" });
    expect(profile?.payload).not.toHaveProperty("industry");
  });

  it("identifies downstream impact areas instead of silently overwriting decisions", () => {
    expect(affectedAreas(questions.find((item) => item.key === "budget_range")!)).toEqual(["BUDGET", "QUOTE", "APPROVALS"]);
    expect(affectedAreas(questions[0])).toEqual(["DISCOVERY_BRIEF", "QUOTE"]);
  });
});
