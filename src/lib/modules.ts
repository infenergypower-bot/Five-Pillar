export interface ResourceField {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "date" | "textarea" | "select";
  required?: boolean;
  options?: readonly { label: string; value: string }[];
}

export interface ModuleDefinition {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  endpoint?: string;
  createLabel?: string;
  fields?: readonly ResourceField[];
  columns: readonly string[];
  guidance: readonly string[];
}

const serviceOptions = [
  { label: "Visual production", value: "VISUAL_PRODUCTION" },
  { label: "Managed marketing", value: "MANAGED_MARKETING" },
  { label: "Combined", value: "COMBINED" },
  { label: "Original entertainment", value: "ORIGINAL_ENTERTAINMENT" },
  { label: "Custom / unsure", value: "CUSTOM" },
] as const;

export const modules: Record<string, ModuleDefinition> = {
  leads: {
    slug: "leads", title: "Leads", eyebrow: "Customer lifecycle", endpoint: "/api/leads", createLabel: "Create lead",
    description: "Qualify opportunities, schedule follow-up, and preserve every sales-stage change.",
    columns: ["businessName", "contactName", "stage", "opportunityValue", "nextFollowUpAt"],
    fields: [
      { name: "businessName", label: "Business name", required: true },
      { name: "contactName", label: "Contact name", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone" },
      { name: "source", label: "Lead source" },
      { name: "servicePath", label: "Primary service", type: "select", required: true, options: serviceOptions },
      { name: "opportunityValue", label: "Expected value", type: "number" },
      { name: "nextFollowUpAt", label: "Next follow-up", type: "date" },
    ],
    guidance: ["Stage changes are audited.", "Lost opportunities require a reason.", "No client record is created until qualification."],
  },
  clients: {
    slug: "clients", title: "Clients & brands", eyebrow: "Account management", endpoint: "/api/clients", createLabel: "Create client",
    description: "Manage organizations, contacts, brands, products, communications, and complete account history.",
    columns: ["displayName", "legalName", "industry", "website", "updatedAt"],
    fields: [
      { name: "legalName", label: "Legal name", required: true },
      { name: "displayName", label: "Public name", required: true },
      { name: "website", label: "Website" },
      { name: "industry", label: "Industry" },
      { name: "businessType", label: "Business type" },
      { name: "primaryContactName", label: "Primary contact", required: true },
      { name: "primaryContactEmail", label: "Contact email", type: "email", required: true },
    ],
    guidance: ["Multiple brands and contacts are supported.", "Records are isolated by organization.", "Client users can only access their assigned client."],
  },
  intake: {
    slug: "intake", title: "Discovery & intake", eyebrow: "Conditional onboarding", endpoint: "/api/intakes", createLabel: "Start intake",
    description: "Run resumable, versioned discovery that branches by selected service and identifies production blockers.",
    columns: ["client", "servicePath", "status", "completeness", "submittedAt"],
    fields: [
      { name: "clientId", label: "Client ID", required: true },
      { name: "servicePath", label: "Service path", type: "select", required: true, options: serviceOptions },
      { name: "businessName", label: "Business or title", required: true },
      { name: "primaryObjective", label: "Primary objective", type: "textarea", required: true },
      { name: "deadline", label: "Desired deadline", type: "date" },
    ],
    guidance: ["Questions branch by service path.", "Progress can be saved and resumed.", "Passwords and unnecessary sensitive information are never requested."],
  },
  quotes: {
    slug: "quotes", title: "Quotes & estimates", eyebrow: "Margin protection", endpoint: "/api/quotes",
    description: "Build decimal-safe estimates, compare versions, and block ordinary approval below the configured minimum margin.",
    columns: ["projectTitle", "servicePath", "status", "currentVersion", "expiresAt"],
    guidance: ["Default target margin is 55%.", "Below 50% requires an authorized audited exception.", "Internal costs never appear in client DTOs."],
  },
  proposals: {
    slug: "proposals", title: "Proposals", eyebrow: "Client investment", endpoint: "/api/proposals",
    description: "Generate versioned branded proposals with scope, timeline, payment schedule, rights, exclusions, and acceptance history.",
    columns: ["projectTitle", "client", "status", "currentVersion", "expiresAt"],
    guidance: ["Client proposals exclude internal costs.", "Sending remains pending until the email provider confirms.", "Acceptance records preserve identity, time, and version."],
  },
  contracts: {
    slug: "contracts", title: "Contracts", eyebrow: "Commercial operations", endpoint: "/api/contracts",
    description: "Track statements of work, configurable payment milestones, renewals, cancellations, and signed-document status.",
    columns: ["number", "title", "client", "status", "signedAt"],
    guidance: ["Default commercial schedule is 50/25/25.", "E-signature is never marked complete without provider confirmation.", "Card data is never stored."],
  },
  projects: {
    slug: "projects", title: "Projects", eyebrow: "Delivery operations", endpoint: "/api/projects",
    description: "Coordinate scope, team, schedule, budget, milestones, tasks, approvals, expenses, and final deliverables.",
    columns: ["title", "servicePath", "status", "budget", "dueAt"],
    guidance: ["Accepted quotes create one project transactionally.", "Production cannot start before required agreement and deposit conditions.", "Status overrides are authorized and audited."],
  },
  productions: {
    slug: "productions", title: "Productions", eyebrow: "Studio floor", endpoint: "/api/projects?production=true",
    description: "Manage production bibles, scenes, shots, takes, generation attempts, continuity, actual credits, and approved media.",
    columns: ["title", "status", "scenes", "approvedShots", "actualCost"],
    guidance: ["Failed generations remain visible.", "Shot-level planned and actual costs are separated.", "Locked creative decisions are versioned."],
  },
  tasks: {
    slug: "tasks", title: "Tasks & milestones", eyebrow: "Capacity planning", endpoint: "/api/tasks",
    description: "Assign production work, compare estimated and actual hours, and manage delivery dependencies.",
    columns: ["title", "project", "assignee", "status", "dueAt"],
    guidance: ["Overdue work surfaces as an alert.", "Milestone order preserves delivery gates.", "Actual labor feeds profitability reporting."],
  },
  reviews: {
    slug: "reviews", title: "Reviews & approvals", eyebrow: "Decision history", endpoint: "/api/reviews",
    description: "Collect timecoded feedback, consolidate revision rounds, and preserve formal approval checkpoints.",
    columns: ["project", "type", "status", "requestedAt", "decidedAt"],
    guidance: ["Rejections require a reason.", "Out-of-scope requests create draft change orders.", "Corrections and changes of direction are distinct."],
  },
  assets: {
    slug: "assets", title: "Assets & files", eyebrow: "Rights-aware library", endpoint: "/api/assets",
    description: "Track secure object-storage metadata, malware-scan status, versions, permissions, licensing, and final deliverables.",
    columns: ["name", "category", "project", "status", "approvalStatus"],
    guidance: ["Uploads use signed object-storage operations.", "Assets remain blocked until scanning is confirmed.", "Cross-client reuse requires explicit rights."],
  },
  invoices: {
    slug: "invoices", title: "Invoices & payments", eyebrow: "Cash operations", endpoint: "/api/invoices",
    description: "Track deposits, milestone invoices, balances, reconciliation, overdue status, and collected cash.",
    columns: ["number", "client", "status", "total", "amountPaid"],
    guidance: ["Provider operations are idempotent.", "Open invoices are not reported as collected revenue.", "Payment confirmation must originate from the provider."],
  },
  subscriptions: {
    slug: "subscriptions", title: "Subscriptions & retainers", eyebrow: "Recurring operations", endpoint: "/api/subscriptions",
    description: "Configure managed-service retainers and allocate real tool costs using transparent rules.",
    columns: ["name", "provider", "billingPeriod", "amount", "renewalAt"],
    guidance: ["Six service levels and Build-Your-Own remain configurable.", "Founder contribution is costed in every tier.", "Unused subscription expense remains visible."],
  },
  costs: {
    slug: "costs", title: "Production costs", eyebrow: "Cost control", endpoint: "/api/costs",
    description: "Manage labor rates, overhead, subscriptions, AI model rates, credit ledgers, expenses, and estimate variance.",
    columns: ["category", "description", "project", "plannedAmount", "actualAmount"],
    guidance: ["Included credits and subscription expense are never double-counted.", "Standalone video excludes unrelated Alphi hosting.", "Provisional rates require administrator verification."],
  },
  reports: {
    slug: "reports", title: "Reports", eyebrow: "Business intelligence", endpoint: "/api/reports",
    description: "Analyze pipeline, revenue, collected cash, margin, utilization, estimate accuracy, capacity, and retention.",
    columns: ["metric", "period", "planned", "actual", "variance"],
    guidance: ["Unpaid invoices are excluded from collected cash.", "Planned and actual costs remain separate.", "Reports can be filtered by division, service, client, and date."],
  },
  creative: {
    slug: "creative", title: "Creative studio", eyebrow: "Creative development", endpoint: "/api/creative",
    description: "Develop briefs, concepts, scripts, production bibles, storyboards, and locked creative decisions.",
    columns: ["title", "project", "version", "approvalStatus", "updatedAt"],
    guidance: ["Every approved artifact is versioned.", "Product accuracy has a formal approval gate.", "Client-visible materials exclude internal prompting economics."],
  },
  "original-ip": {
    slug: "original-ip", title: "Original entertainment & IP", eyebrow: "Studio portfolio", endpoint: "/api/original-titles", createLabel: "Create original title",
    description: "Develop internally sponsored entertainment while tracking rights, financing, production costs, distribution assumptions, and recoupment.",
    columns: ["workingTitle", "format", "rightsStatus", "financingStatus", "developmentBudget"],
    fields: [
      { name: "workingTitle", label: "Working title", required: true },
      { name: "format", label: "Format", type: "select", required: true, options: [{ label: "Short film", value: "SHORT_FILM" }, { label: "Feature film", value: "FEATURE_FILM" }, { label: "Series", value: "SERIES" }, { label: "Music video", value: "MUSIC_VIDEO" }, { label: "Proof of concept", value: "PROOF_OF_CONCEPT" }, { label: "Other", value: "OTHER" }] },
      { name: "genre", label: "Genre", required: true },
      { name: "logline", label: "Logline", type: "textarea", required: true },
      { name: "developmentBudget", label: "Development budget", type: "number", required: true },
    ],
    guidance: ["An internal sponsor can replace a fictional external customer.", "Revenue projections are always labeled speculative.", "Rights and recoupment records are versioned and auditable."],
  },
  integrations: {
    slug: "integrations", title: "Alphi AI integration", eyebrow: "Controlled handoff", endpoint: "/api/integrations",
    description: "Queue approved managed-marketing handoffs with retry, idempotency, and transparent synchronization status.",
    columns: ["provider", "eventType", "aggregate", "status", "attempts"],
    guidance: ["Approval never triggers publishing.", "Unavailable providers leave events pending.", "Only approved and rights-cleared assets can be handed off."],
  },
  settings: {
    slug: "settings", title: "Settings", eyebrow: "Administration", endpoint: "/api/settings",
    description: "Configure users, permissions, rates, margins, packages, templates, integrations, retention, and provisional assumptions.",
    columns: ["area", "setting", "value", "effectiveFrom", "status"],
    guidance: ["Secrets remain in Railway variables.", "All financial configuration is effective-dated.", "Material changes produce audit events."],
  },
  portal: {
    slug: "portal", title: "Client portal", eyebrow: "Secure customer experience", endpoint: "/api/portal",
    description: "Complete onboarding, review proposals, track milestones, approve work, request revisions, and download approved deliverables.",
    columns: ["title", "type", "status", "dueAt", "action"],
    guidance: ["Only the authenticated client's records are returned.", "Internal costs and margins are never serialized.", "Downloads require rights-cleared approved assets."],
  },
};
