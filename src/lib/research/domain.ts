export type EvidenceKind = "VERIFIED" | "INFERRED" | "HYPOTHESIS" | "UNKNOWN";
export type ReviewState = "DRAFT" | "APPROVED" | "REJECTED";
export type Pillar = "BUSINESS_INTELLIGENCE" | "STRATEGIC_GROWTH" | "BRAND_EXCELLENCE" | "CINEMATIC_ADVERTISING" | "MARKET_IMPACT";

export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  capturedAt: string;
  type: "PUBLIC_WEB" | "CLIENT_STATEMENT" | "CLIENT_DOCUMENT";
}

export interface ResearchAnswer {
  questionId: string;
  value: string | null;
  kind: EvidenceKind;
  sourceIds: string[];
  confidence: number;
  rationale: string;
  status: ReviewState;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface BusinessProfileData {
  answers: ResearchAnswer[];
  sources: ResearchSource[];
  notes: string;
}

export interface ResearchFinding {
  id: string;
  topic: string;
  field: string;
  value: string | null;
  kind: EvidenceKind;
  confidence: number;
  rationale: string;
  sourceIds: string[];
  status: ReviewState;
}

export interface GrowthOpportunity {
  id: string;
  title: string;
  pillar: Pillar;
  action: string;
  targetSegment: string;
  successMetric: string;
  evidenceFindingIds: string[];
  bookRefs: { title: string; url: string; pages: number[] }[];
  priority: "HIGH" | "MEDIUM" | "LOW" | "UNSCORED";
  impact: number | null;
  effort: number | null;
  uncertainty: number | null;
  status: ReviewState;
}

export interface GrowthAudit {
  findings: ResearchFinding[];
  sources: ResearchSource[];
  competitors: {
    name: string; website: string; type: string; positioning: string; offers: string;
    pricing: string; advantages: string; gaps: string; sourceIds: string[];
  }[];
  segments: {
    name: string; description: string; geography: string; sample: string;
    demographics: string; psychographics: string; needs: string; triggers: string;
    objections: string; lifestyle: string; adjacentOwnership: string;
    contentHabits: string; entertainmentAffinities: string;
    confidence: number; sourceIds: string[];
  }[];
  opportunities: GrowthOpportunity[];
  completedAt: string;
  limitations: string[];
}

export interface Question {
  id: string;
  pillar: Pillar;
  category: string;
  prompt: string;
}

const group = (pillar: Pillar, category: string, items: readonly [string, string][]): Question[] =>
  items.map(([id, prompt]) => ({ id, pillar, category, prompt }));

export const questions: Question[] = [
  ...group("BUSINESS_INTELLIGENCE", "Company and economics", [
    ["business_model", "How does the company make money, and which offers drive revenue?"],
    ["legal_ownership", "Who owns and operates the business, and where does it operate?"],
    ["history_mission", "What is the origin, mission, vision, and stated direction?"],
    ["offers", "What products and services are sold, at what publicly stated prices?"],
    ["revenue_mix", "Which customer and offer segments contribute revenue and gross profit?"],
    ["purchase_frequency", "How often does a customer buy again by segment?"],
    ["gross_margin", "What gross margin does each offer produce?"],
    ["capacity", "What capacity, fulfillment, and operational constraints limit growth?"],
    ["kpi_owner", "Which decision metrics have an owner, baseline, and review cadence?"],
    ["funnel_counts", "How many visitors, inquiries, qualified leads, proposals, and sales occur in one period?"],
  ]),
  ...group("STRATEGIC_GROWTH", "Market and opportunity", [
    ["target_customer", "Who buys, who is most profitable, and who is underserved?"],
    ["market_geography", "Which markets and locations are served or planned?"],
    ["buyer_alternatives", "Which direct, indirect, and do-nothing alternatives do buyers consider?"],
    ["noncustomer_barriers", "Who avoids the category and why?"],
    ["complementary_purchases", "What do customers buy before, during, and after this offer?"],
    ["partner_channels", "Which complementary businesses reach the same audience?"],
    ["referral_process", "How and when are satisfied customers asked for referrals?"],
    ["retention_process", "How are repeat purchases, churn, and customer health measured?"],
    ["pricing_strategy", "How are prices, bundles, tiers, and promotions decided?"],
    ["growth_constraints", "What is preventing the next stage of growth?"],
  ]),
  ...group("BRAND_EXCELLENCE", "Brand and positioning", [
    ["brand_promise", "What promise does the brand make to buyers?"],
    ["differentiation_evidence", "Why choose this company, and what proof supports that reason?"],
    ["brand_voice", "What voice, values, personality, and visual conventions are consistent?"],
    ["brand_architecture", "How do parent brand, subbrands, products, and categories relate?"],
    ["reputation", "What themes appear in verified reviews, complaints, and praise?"],
    ["customer_experience", "What is the end-to-end buyer experience, including service recovery?"],
    ["claims_proof", "Which marketing claims are substantiated and approved for use?"],
    ["website_journey", "What does a visitor see, understand, trust, and do on the website?"],
  ]),
  ...group("CINEMATIC_ADVERTISING", "Audience and creative", [
    ["audience_segments", "Which evidence-backed customer segments have distinct jobs and buying triggers?"],
    ["demographics", "What aggregate demographic patterns are documented, with scope and sample?"],
    ["psychographics", "What needs, values, motivations, and objections are supported by research?"],
    ["lifestyle", "What daily contexts and routines matter to the purchase?"],
    ["adjacent_ownership", "What adjacent products do customers already own, based on evidence?"],
    ["content_consumption", "Which content formats and platforms does each segment actually consume?"],
    ["entertainment_affinity", "Are any movies, shows, celebrities, characters, or genres linked to this segment by credible evidence?"],
    ["creative_assets", "Which approved stories, characters, footage, proof, and rights-cleared assets exist?"],
    ["creative_performance", "Which past hooks, stories, and ads measurably worked for each segment?"],
  ]),
  ...group("MARKET_IMPACT", "Channels and conversion", [
    ["channel_mix", "Where are buyers discovered and acquired, and at what cost?"],
    ["search_presence", "How does the company appear for relevant searches and local intent?"],
    ["social_presence", "Which channels are active and what engagement leads to business outcomes?"],
    ["sales_process", "How does a qualified lead move through sales?"],
    ["objection_log", "Which recurring objections and lost-deal reasons are documented?"],
    ["followup_process", "What happens after an inquiry, abandoned cart, purchase, or lapse?"],
    ["conversion_friction", "Where do users drop off and what evidence explains the friction?"],
    ["measurement_attribution", "Can the business connect campaigns to qualified customers and revenue?"],
    ["customer_feedback", "How is feedback collected, segmented, and used to improve offers?"],
  ]),
];

export function emptyProfile(): BusinessProfileData {
  return { answers: questions.map(q => ({
    questionId: q.id, value: null, kind: "UNKNOWN", sourceIds: [], confidence: 0,
    rationale: "Research pending", status: "DRAFT",
  })), sources: [], notes: "" };
}

export function profileProgress(profile: BusinessProfileData) {
  const answered = profile.answers.filter(a => a.value !== null && a.kind !== "UNKNOWN");
  return { total: questions.length, answered: answered.length, approved: answered.filter(a => a.status === "APPROVED").length };
}

export function canApproveProfile(profile: BusinessProfileData): { ready: boolean; errors: string[] } {
  const ids = new Set(profile.sources.map(s => s.id));
  const errors: string[] = [];
  for (const answer of profile.answers) {
    if (answer.status !== "APPROVED" || answer.kind === "UNKNOWN") continue;
    if (!answer.value?.trim()) errors.push(`${answer.questionId}: missing value`);
    if (!answer.sourceIds.length || answer.sourceIds.some(id => !ids.has(id))) errors.push(`${answer.questionId}: source missing`);
    if (!answer.reviewedBy || !answer.reviewedAt) errors.push(`${answer.questionId}: review missing`);
  }
  if (!profile.answers.some(a => a.status === "APPROVED" && a.kind === "VERIFIED")) errors.push("At least one sourced, reviewed fact is required");
  return { ready: errors.length === 0, errors };
}

export function signOffSourcedAnswers(profile: BusinessProfileData, reviewerId: string, reviewedAt: string): BusinessProfileData {
  const sourceIds = new Set(profile.sources.map(source => source.id));
  return { ...profile, answers: profile.answers.map(answer => {
    if (!answer.value || !["VERIFIED", "INFERRED"].includes(answer.kind) || !answer.sourceIds.length || answer.sourceIds.some(id => !sourceIds.has(id))) return answer;
    return { ...answer, status: "APPROVED" as const, reviewedBy: reviewerId, reviewedAt };
  }) };
}

