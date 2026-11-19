import { describe, expect, it } from "vitest";
import { assembleGrowth, mergeProfile, type AgentTask } from "./agents";
import { canApproveProfile, emptyProfile, profileProgress, signOffSourcedAnswers } from "./domain";
import { infenergyBaseline } from "./infenergy-baseline";
import { infenergyGrowthBaseline } from "./infenergy-growth";

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

  it("keeps a qualitative best estimate clearly marked as a low-confidence hypothesis", () => {
    const data = emptyProfile();
    const tasks: AgentTask[] = [{ lane: "audience", status: "COMPLETE", result: {
      summary: "", recommendations: [], competitors: [], segments: [], findings: [
        { field: "content_consumption", topic: "Audience", value: "Likely uses product comparisons; validate with survey and campaign analytics", kind: "INFERRED", confidence: 0.8, rationale: "No direct segment study", evidenceUrls: [] },
      ],
    } }];
    const answer = mergeProfile(data, tasks, []).answers.find(a => a.questionId === "content_consumption");
    expect(answer).toMatchObject({ kind: "HYPOTHESIS", confidence: 0.3, sourceIds: [], status: "DRAFT" });
    expect(answer?.value).toContain("validate");
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

  it("drafts every Infenergy question from the dated public baseline and preserves owner edits", () => {
    const original = emptyProfile();
    const baseline = infenergyBaseline(original);
    expect(profileProgress(baseline)).toEqual({ total: 46, answered: 46, approved: 0 });
    expect(baseline.answers.every(answer => answer.value && answer.sourceIds.every(id => baseline.sources.some(source => source.id === id)))).toBe(true);
    expect(baseline.answers.find(answer => answer.questionId === "gross_margin")?.kind).toBe("HYPOTHESIS");
    const reviewed = { ...original, answers: original.answers.map(answer => answer.questionId === "brand_promise" ? { ...answer, value: "Owner-approved promise", status: "APPROVED" as const } : answer) };
    expect(infenergyBaseline(reviewed).answers.find(answer => answer.questionId === "brand_promise")?.value).toBe("Owner-approved promise");
  });

  it("approves sourced facts in one action while leaving private estimates provisional", () => {
    const signed = signOffSourcedAnswers(infenergyBaseline(emptyProfile()), "owner", "2026-11-19T00:00:00Z");
    expect(canApproveProfile(signed).ready).toBe(true);
    expect(profileProgress(signed).approved).toBeGreaterThan(0);
    expect(signed.answers.find(a => a.questionId === "gross_margin")?.status).toBe("DRAFT");
  });

  it("provides a source-linked Infenergy market baseline without inventing audience measurements", () => {
    const audit = infenergyGrowthBaseline("2026-11-19T00:00:00Z");
    expect(audit.competitors).toHaveLength(4);
    expect(audit.segments).toHaveLength(3);
    expect(audit.opportunities.length).toBeGreaterThan(0);
    expect(audit.findings.every(f => f.sourceIds.every(id => audit.sources.some(s => s.id === id)))).toBe(true);
    expect(audit.segments.every(s => s.entertainmentAffinities === "Unknown" || s.entertainmentAffinities.startsWith("Unknown"))).toBe(true);
  });
});

