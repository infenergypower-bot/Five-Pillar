export type ApprovalType =
  | "CONCEPT"
  | "SCRIPT"
  | "CHARACTER"
  | "PRODUCT_ACCURACY"
  | "STORYBOARD"
  | "ROUGH_CUT"
  | "FINAL_CUT"
  | "DELIVERY";

export type ProjectStatus =
  | "INTAKE"
  | "AWAITING_ASSETS"
  | "DISCOVERY_COMPLETE"
  | "CONCEPT_DEVELOPMENT"
  | "SCRIPT_DEVELOPMENT"
  | "SCRIPT_REVIEW"
  | "VISUAL_DEVELOPMENT"
  | "STORYBOARDING"
  | "PRODUCTION_READY"
  | "GENERATION"
  | "EDITING"
  | "INTERNAL_REVIEW"
  | "CLIENT_REVIEW"
  | "REVISIONS"
  | "FINAL_APPROVAL"
  | "AWAITING_FINAL_PAYMENT"
  | "DELIVERY"
  | "COMPLETED"
  | "ARCHIVED"
  | "ON_HOLD"
  | "CANCELLED";

const transitions: Partial<Record<ProjectStatus, readonly ProjectStatus[]>> = {
  INTAKE: ["AWAITING_ASSETS", "DISCOVERY_COMPLETE", "ON_HOLD", "CANCELLED"],
  AWAITING_ASSETS: ["DISCOVERY_COMPLETE", "ON_HOLD", "CANCELLED"],
  DISCOVERY_COMPLETE: ["CONCEPT_DEVELOPMENT", "SCRIPT_DEVELOPMENT", "ON_HOLD", "CANCELLED"],
  CONCEPT_DEVELOPMENT: ["SCRIPT_DEVELOPMENT", "ON_HOLD", "CANCELLED"],
  SCRIPT_DEVELOPMENT: ["SCRIPT_REVIEW", "ON_HOLD", "CANCELLED"],
  SCRIPT_REVIEW: ["SCRIPT_DEVELOPMENT", "VISUAL_DEVELOPMENT", "ON_HOLD", "CANCELLED"],
  VISUAL_DEVELOPMENT: ["STORYBOARDING", "ON_HOLD", "CANCELLED"],
  STORYBOARDING: ["VISUAL_DEVELOPMENT", "PRODUCTION_READY", "ON_HOLD", "CANCELLED"],
  PRODUCTION_READY: ["GENERATION", "ON_HOLD", "CANCELLED"],
  GENERATION: ["EDITING", "ON_HOLD", "CANCELLED"],
  EDITING: ["INTERNAL_REVIEW", "ON_HOLD", "CANCELLED"],
  INTERNAL_REVIEW: ["EDITING", "CLIENT_REVIEW", "ON_HOLD", "CANCELLED"],
  CLIENT_REVIEW: ["REVISIONS", "FINAL_APPROVAL", "ON_HOLD", "CANCELLED"],
  REVISIONS: ["INTERNAL_REVIEW", "CLIENT_REVIEW", "ON_HOLD", "CANCELLED"],
  FINAL_APPROVAL: ["AWAITING_FINAL_PAYMENT", "DELIVERY", "ON_HOLD"],
  AWAITING_FINAL_PAYMENT: ["DELIVERY", "ON_HOLD"],
  DELIVERY: ["COMPLETED", "ON_HOLD"],
  COMPLETED: ["ARCHIVED"],
  ON_HOLD: ["INTAKE", "CONCEPT_DEVELOPMENT", "SCRIPT_DEVELOPMENT", "GENERATION", "EDITING", "CLIENT_REVIEW", "CANCELLED"],
};

export function assertProjectTransition(from: ProjectStatus, to: ProjectStatus): void {
  if (!transitions[from]?.includes(to)) throw new Error(`Invalid project transition: ${from} -> ${to}`);
}

export function projectBlueprintFromAcceptedQuote(input: {
  quoteId: string;
  title: string;
  servicePath: string;
  clientId?: string;
  dueAt?: Date;
}) {
  return {
    quoteId: input.quoteId,
    title: input.title,
    servicePath: input.servicePath,
    clientId: input.clientId,
    status: "INTAKE" as const,
    dueAt: input.dueAt,
    milestones: [
      { name: "Discovery complete", sequence: 1 },
      { name: "Creative approved", sequence: 2 },
      { name: "Production complete", sequence: 3 },
      { name: "Final delivery", sequence: 4 },
    ],
    tasks: [
      { title: "Confirm intake and source assets", sequence: 1 },
      { title: "Prepare production brief", sequence: 2 },
      { title: "Build production schedule", sequence: 3 },
    ],
    approvals: ["CONCEPT", "SCRIPT", "STORYBOARD", "ROUGH_CUT", "FINAL_CUT", "DELIVERY"] as ApprovalType[],
  };
}

export type InvoiceStatus = "DRAFT" | "OPEN" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "VOID";

export function invoiceStatus(input: {
  amount: number;
  paid: number;
  dueAt: Date;
  now?: Date;
  voided?: boolean;
}): InvoiceStatus {
  if (input.voided) return "VOID";
  if (input.paid >= input.amount) return "PAID";
  if (input.paid > 0) return "PARTIALLY_PAID";
  if (input.dueAt.getTime() < (input.now ?? new Date()).getTime()) return "OVERDUE";
  return "OPEN";
}
