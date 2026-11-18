import { describe, expect, it } from "vitest";
import { assembleGrowth, mergeProfile, type AgentTask } from "./agents";
import { canApproveProfile, emptyProfile, profileProgress } from "./domain";

describe("business research evidence gates", () => {
  it("starts with every Five Pillar question unanswered", () => {
    const data = emptyProfile();
    expect(profileProgress(data).total).toBeGreaterThan(40);
    expect(profileProgress(data).answered).toBe(0);
    expect(canApproveProfile(data).ready).toBe(false);
  });

  it("retains reviewed answers when research refreshes and leaves unsupported fields unknown", () => {
    const data = emptyProfile();
    data.sources.push({ id: "owner", title: "Owner interview", url: "https://example.com/interview", type: "CLIENT_STATEMENT", capturedAt: "2026-11-18T00:00:00Z" });
    data.answers = data.answers.map(a => a.questionId === "business_model" ? { ...a, value: "Subscription", kind: "VERIFIED", status: "APPROVED", sourceIds: ["owner"], reviewedAt: "2026-11-18T00:00:00Z", reviewedBy: "reviewer" } : a);
    const tasks: AgentTask[] = [{ lane: "company", status: "COMPLETE", result: {
      summary: "", recommendations: [], competitors: [], segments: [], findings: [
        { field: "business_model", topic: "Company", value: "Advertising", kind: "VERIFIED", confidence: 0.9, rationale: "", evidenceUrls: ["https://example.com"] },
        { field: "gross_margin", topic: "Financial", value: "60%", kind: "VERIFIED", confidence: 0.9, rationale: "", evidenceUrls: [] },
      ],
    } }];
    const merged = mergeProfile(data, tasks, []);
    expect(merged.answers.find(a => a.questionId === "business_model")?.value).toBe("Subscription");
    expect(merged.answers.find(a => a.questionId === "gross_margin")?.kind).toBe("UNKNOWN");
    expect(canApproveProfile(merged).ready).toBe(true);
  });

  it("only produces opportunities tied to source-linked findings", () => {
    const task: AgentTask = { lane: "competitors", status: "COMPLETE", result: {
      summary: "", competitors: [], segments: [], findings: [
        { field: "rival_gap", topic: "Competitors", value: "Long fulfillment wait", kind: "VERIFIED", confidence: 0.7, rationale: "Observed", evidenceUrls: ["https://example.com/reviews"] },
        { field: "celebrity_affinity", topic: "Audience", value: "Likes a celebrity", kind: "HYPOTHESIS", confidence: 0.2, rationale: "Unproven", evidenceUrls: [] },
      ],
      recommendations: [
        { title: "Pilot faster fulfillment", pillar: "STRATEGIC_GROWTH", action: "Test", targetSegment: "Buyers", successMetric: "Repeat rate", sourceFields: ["rival_gap"], bookKey: "metrics" },
        { title: "Use celebrity", pillar: "CINEMATIC_ADVERTISING", action: "Produce", targetSegment: "Buyers", successMetric: "Views", sourceFields: ["celebrity_affinity"], bookKey: "" },
      ],
    } };
    const audit = assembleGrowth([task], [{ id: "example.com/reviews", url: "https://example.com/reviews", title: "Reviews", type: "PUBLIC_WEB", capturedAt: "2026-11-18T00:00:00Z" }]);
    expect(audit.opportunities).toHaveLength(1);
    expect(audit.opportunities[0].impact).toBeNull();
    expect(audit.opportunities[0].bookRefs[0].pages).toContain(20);
  });
});
