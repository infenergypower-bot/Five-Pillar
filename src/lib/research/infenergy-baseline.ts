import { questions, type BusinessProfileData, type EvidenceKind, type ResearchSource } from "./domain";

/** Public, dated baseline for the owner's existing Infenergy profile.
 * It is a starting research draft, not owner-approved internal data.
 */
const urls = {
  about: "https://infenergypower.com/about-us/",
  shop: "https://infenergypower.com/shop/",
  powercharge: "https://infenergypower.com/powercharge-pro/",
  solarflex: "https://infenergypower.com/product/solarflex-titan-20k-foldable-20000mah-solar-power-bank/",
  sorein: "https://infenergypower.com/infenergy-sorein/",
  compare: "https://infenergypower.com/power-comparison/",
  help: "https://infenergypower.com/power-help/",
  tracking: "https://infenergypower.com/order-tracking/",
  terms: "https://infenergypower.com/terms/",
  home: "https://infenergypower.com/",
} as const;
type SourceKey = keyof typeof urls;
type Draft = { value: string; kind: EvidenceKind; sources: SourceKey[]; rationale: string };
const V = (value: string, ...sources: SourceKey[]): Draft => ({ value, kind: "VERIFIED", sources, rationale: "Directly stated on an Infenergy public page; confirm current details before client delivery." });
const I = (value: string, ...sources: SourceKey[]): Draft => ({ value, kind: "INFERRED", sources, rationale: "Reasoned interpretation of the linked public pages; validate with company data." });
const H = (value: string, ...sources: SourceKey[]): Draft => ({ value, kind: "HYPOTHESIS", sources, rationale: "Closest defensible working answer. No company-specific measurement was found; validate with first-party records or research." });

const drafts: Record<string, Draft> = {
  business_model: I("Infenergy sells portable charging, solar panels, power stations, and backup systems through its online catalog. Product purchases appear to be the principal public revenue path; actual revenue by offer is private.", "shop"),
  legal_ownership: V("The public terms identify Infenergy LLC as a Texas-based company. Its About page traces the brand to a Houston storm; the current legal owners and operating footprint need confirmation from company records.", "terms", "about"),
  history_mission: V("Infenergy says a Houston winter storm inspired its purpose: dependable power for everyday use and future disruptions. Its stated approach is useful today, ready tomorrow, across pocket, vehicle, outdoor, solar, and home needs.", "about"),
  offers: V("The live catalog lists PowerCharge Pro from $64.99, SolarFlex Titan 20K at $69.99 on sale, Sorein modular power configurations from $273, and home backup, everyday charging, portable power, and solar options. Prices change; verify the live listings.", "shop", "powercharge", "solarflex"),
  revenue_mix: H("The catalog spans lower-ticket chargers and larger backup systems, so revenue could be concentrated differently from unit volume. Actual customer, product, margin, and channel mix requires order exports and SKU-level costs; segment sales by SKU and customer cohort.", "shop"),
  purchase_frequency: H("Repeat purchase is unreported. A plausible path is accessory or panel add-ons and later upgrades from a personal charger to backup power; calculate 30/90/365-day repeat rates by first product and customer cohort from orders.", "shop", "sorein"),
  gross_margin: H("No company gross margins are public. Calculate each SKU's realized price minus landed product cost, shipping subsidy, payment fee, and returns; do not treat catalog sale percentage as margin.", "shop"),
  capacity: H("Public pages show physical products and variant choices, implying inventory, supplier lead times, shipping, compatibility support, and returns may constrain scaling. Verify stockouts, fulfillment time, supplier terms, support load, and cash conversion internally.", "shop", "help"),
  kpi_owner: H("No public KPI ownership or cadence is documented. Closest operating scorecard: traffic, product-page to cart, checkout, contribution margin, return rate, repeat purchase, support resolution, and on-time delivery, each with a named owner and weekly review.", "shop", "tracking"),
  funnel_counts: H("Visitor, inquiry, lead, cart, checkout, and order counts are not public. Pull a common 30-day period from site analytics, WooCommerce, CRM, and ad platforms; reconcile sessions to completed orders and revenue.", "shop"),

  target_customer: I("Public offers address everyday phone charging, travel, camping/RV use, and home outage preparedness. The most profitable and underserved customers cannot be identified from the catalog alone; compare cohorts by contribution margin and unmet need.", "about", "shop"),
  market_geography: I("Infenergy describes a Houston origin and sells through an online store with travel, outdoor, and home-use offers. The precise shipping footprint, geographic sales mix, and expansion plans need company confirmation.", "about", "shop"),
  buyer_alternatives: I("Buyers can choose another charger or power station, a generator, fixed backup, or no purchase. Compare alternatives on runtime, compatibility, portability, noise, price, support, and charging method; a named competitor set needs a separate current audit.", "shop", "compare"),
  noncustomer_barriers: H("Potential barriers include uncertainty about required wattage, compatibility, runtime, up-front price, and whether an outage will happen. Test these with nonbuyer interviews and abandoned-cart reasons; do not assume prevalence.", "help", "compare"),
  complementary_purchases: I("Likely adjacent purchases include phones and cables before personal charging, and power stations, compatible solar panels, essential appliances, and travel gear around backup setups. Confirm attach rates in order data.", "powercharge", "sorein", "help"),
  partner_channels: H("Potential partners include RV/camping retailers, emergency-preparedness educators, home services, and device-accessory sellers serving overlapping needs. No active partner performance is public; test partner leads and attributed orders.", "shop", "about"),
  referral_process: H("A formal referral ask or reward process is not evident on the reviewed public pages. Validate post-delivery communication and consent, then test an ask after successful product use and track referred orders.", "shop"),
  retention_process: H("The public order-tracking and help pages support service after purchase, but cohort retention and churn measurement are not disclosed. Segment repeat orders, accessories, support contacts, and returns by first purchase.", "tracking", "help"),
  pricing_strategy: I("The catalog presents variants, sale prices, and ready-to-go kits; the rules for discounts and margin protection are private. Compare contribution margin and conversion by SKU, bundle, and promotion before revising prices.", "shop"),
  growth_constraints: H("The highest-priority constraint is unproven without funnel and economics data. Audit traffic quality, product clarity, compatibility questions, checkout completion, inventory, and contribution margin before choosing an intervention.", "shop", "help"),

  brand_promise: V("Infenergy promises dependable power integrated into everyday life and readiness for disruptions, expressed as 'useful today, ready tomorrow' on its About page.", "about"),
  differentiation_evidence: I("The public story combines everyday charging with layered outage preparedness, product comparison, a guided finder, and modular solar options. Distinctiveness against competitors and customer proof require comparative research.", "about", "shop", "compare"),
  brand_voice: I("Reviewed pages use practical preparedness, confidence, and freedom language, with an approachable product-guide voice. A complete visual and verbal consistency audit across all channels is still needed.", "about", "shop", "help"),
  brand_architecture: V("Infenergy is the umbrella store brand; PowerCharge Pro and SolarFlex Titan 20K are named products, while Sorein is presented as a modular power system. The shop groups home backup, portable, everyday, solar, and outdoor options.", "shop", "sorein"),
  reputation: H("The reviewed public pages do not establish a representative, independently verified review sample. Collect verified purchase reviews, support tickets, refunds, and third-party ratings before asserting praise or complaint themes.", "shop"),
  customer_experience: I("A visitor can browse categories, compare products, use a guided finder, buy through the store, track orders, and consult a help center. Actual delivery, support resolution, and recovery performance require customer records.", "shop", "compare", "tracking", "help"),
  claims_proof: H("Product pages publish capacities and charging claims, but substantiation varies by SKU and use conditions. Maintain manufacturer documentation and test evidence for runtime, solar output, compatibility, safety, and warranty claims before use in ads.", "powercharge", "solarflex", "help"),
  website_journey: I("The shop offers categories, a featured assortment, bundles, product comparison, and guided selection. Measure where visitors stall between landing, product choice, cart, checkout, and post-purchase support rather than assuming a conversion issue.", "shop", "compare", "help"),

  audience_segments: I("Working need-based segments are everyday mobile charging, outdoor/RV power, and household outage backup. These are offer/use-case segments, not verified customer cohorts; validate with orders, interviews, and on-site behavior.", "shop", "about"),
  demographics: H("No representative Infenergy customer age, income, household, or regional distribution is public. Use consented order geography and an opt-in survey, report sample size and bias, and avoid assigning demographics from product categories.", "shop"),
  psychographics: I("The brand positions its products around staying connected, autonomy, preparedness, and reducing disruption. These are likely purchase motivations, not measured beliefs of actual customers; test by segment with interviews and surveys.", "about", "help"),
  lifestyle: I("Product use cases include commuting/travel with devices, camping or RV activity, remote work, and keeping essential devices running during an outage. Measure which situations actually occur among buyers.", "about", "shop", "help"),
  adjacent_ownership: I("Relevant adjacent equipment may include smartphones and wearables for PowerCharge Pro, and appliances or compatible solar input for backup systems. The actual ownership rates and brands are unknown; ask buyers and examine support questions.", "powercharge", "sorein", "help"),
  content_consumption: H("No segment-level content or platform consumption data is public. Test short product demonstrations, practical outage checklists, comparison guides, and real-use stories across channels; measure qualified visits and orders by segment.", "shop", "compare"),
  entertainment_affinity: H("No credible Infenergy customer study links a segment to specific movies, celebrities, superheroes, characters, or genres. Use opt-in audience research before targeting or creative references; do not infer tastes from age or category.", "shop"),
  creative_assets: I("Public product pages and comparison materials provide product imagery and specifications. A rights-cleared inventory of original ads, footage, characters, testimonials, and usage permissions must be confirmed internally.", "powercharge", "shop", "compare"),
  creative_performance: H("The public site does not reveal ad-level hook, creative, or conversion performance. Build a creative log joining spend, impressions, click-through, qualified visits, purchases, and margin by audience and asset.", "shop"),

  channel_mix: H("The owned website is a visible sales channel. Actual acquisition sources, customer acquisition cost, and channel revenue are private; reconcile analytics, ad spend, referral tags, CRM, and orders.", "shop"),
  search_presence: I("The public site has indexed product, category, comparison, and help pages for portable charging and backup topics. Rankings, local intent coverage, organic traffic, and search conversion need Search Console and analytics.", "shop", "compare", "help"),
  social_presence: H("A public site alone does not establish which social accounts are active or what engagement sells. Inventory official accounts and connect tagged visits, assisted purchases, and customer inquiries to each platform.", "home"),
  sales_process: I("For direct e-commerce, the visible path is product discovery to selection and checkout; higher-consideration backup questions can route through the help/contact flow. Internal lead qualification and quote handling are not public.", "shop", "help"),
  objection_log: H("No company-wide lost-deal log is public. Likely questions from the help content concern compatibility, wattage, runtime, charging, shipping, and warranty; tag actual inquiries and abandoned carts before ranking objections.", "help"),
  followup_process: H("Order tracking and support are visible after purchase, but inquiry, abandoned-cart, onboarding, and lapse sequences are not documented publicly. Audit consent, triggers, messages, and conversion by stage in the store and CRM.", "tracking", "help"),
  conversion_friction: H("Possible friction includes choosing the right system, understanding compatibility and runtime, and comparing variants. The finder and comparison tools address those questions; actual drop-off points require event and session analysis.", "compare", "help", "shop"),
  measurement_attribution: H("There is no public proof that campaigns are tied to qualified customers and contribution margin. Define source tags and order IDs, then join campaign cost, new-customer orders, refunds, and repeat value.", "shop"),
  customer_feedback: H("The help and contact paths allow questions, but a systematic segmented feedback loop is not visible. Combine verified reviews, support reasons, returns, post-purchase surveys, and product cohort in a monthly review.", "help", "tracking"),
};

export function isInfenergyProfile(businessName: string, website: string | null): boolean {
  return businessName.trim().toLowerCase() === "infenergy power" || (!!website && website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "").toLowerCase() === "infenergypower.com");
}

export function infenergyBaseline(existing: BusinessProfileData): BusinessProfileData {
  const capturedAt = "2026-11-18T00:00:00.000Z";
  const sources: ResearchSource[] = Object.entries(urls).map(([key, url]) => ({ id: `infenergy:${key}`, title: `Infenergy ${key}`, url, type: "PUBLIC_WEB", capturedAt }));
  const known = new Set(existing.sources.map(s => s.id));
  return {
    ...existing,
    sources: [...existing.sources, ...sources.filter(s => !known.has(s.id))],
    answers: questions.map(q => {
      const prior = existing.answers.find(a => a.questionId === q.id);
      if (prior?.value || prior?.status === "APPROVED") return prior;
      const draft = drafts[q.id];
      if (!draft) throw new Error(`Missing Infenergy research answer: ${q.id}`);
      return { questionId: q.id, value: draft.value, kind: draft.kind, sourceIds: draft.sources.map(key => `infenergy:${key}`), confidence: draft.kind === "VERIFIED" ? 0.85 : draft.kind === "INFERRED" ? 0.55 : 0.2, rationale: draft.rationale, status: "DRAFT" as const };
    }),
    notes: "Public Infenergy research baseline compiled 2026-11-18. Verify current prices, company records, audience data, and claims before external use.",
  };
}

