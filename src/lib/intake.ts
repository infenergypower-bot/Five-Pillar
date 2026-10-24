export type ServicePath =
  | "VISUAL_PRODUCTION"
  | "MANAGED_MARKETING"
  | "COMBINED"
  | "ORIGINAL_ENTERTAINMENT"
  | "CUSTOM";

export type RequirementLevel = "required" | "recommended" | "optional";

export interface IntakeRequirement {
  key: string;
  level: RequirementLevel;
  label: string;
  paths: readonly ServicePath[];
}

export const intakeRequirements: readonly IntakeRequirement[] = [
  { key: "businessName", level: "required", label: "Business or project name", paths: ["VISUAL_PRODUCTION", "MANAGED_MARKETING", "COMBINED", "ORIGINAL_ENTERTAINMENT", "CUSTOM"] },
  { key: "primaryObjective", level: "required", label: "Primary objective", paths: ["VISUAL_PRODUCTION", "MANAGED_MARKETING", "COMBINED", "ORIGINAL_ENTERTAINMENT", "CUSTOM"] },
  { key: "deadline", level: "recommended", label: "Desired timeline", paths: ["VISUAL_PRODUCTION", "MANAGED_MARKETING", "COMBINED", "ORIGINAL_ENTERTAINMENT", "CUSTOM"] },
  { key: "brandProfile", level: "required", label: "Brand profile", paths: ["VISUAL_PRODUCTION", "MANAGED_MARKETING", "COMBINED"] },
  { key: "productionType", level: "required", label: "Production type", paths: ["VISUAL_PRODUCTION", "COMBINED"] },
  { key: "visualDirection", level: "required", label: "Visual direction", paths: ["VISUAL_PRODUCTION", "COMBINED", "ORIGINAL_ENTERTAINMENT"] },
  { key: "productReferences", level: "required", label: "Product or character references", paths: ["VISUAL_PRODUCTION", "COMBINED"] },
  { key: "socialProfiles", level: "required", label: "Current social profiles", paths: ["MANAGED_MARKETING", "COMBINED"] },
  { key: "approvalPreferences", level: "required", label: "Approval preferences", paths: ["MANAGED_MARKETING", "COMBINED"] },
  { key: "contentVolume", level: "recommended", label: "Desired content volume", paths: ["MANAGED_MARKETING", "COMBINED"] },
  { key: "logline", level: "required", label: "Logline", paths: ["ORIGINAL_ENTERTAINMENT"] },
  { key: "rightsStatus", level: "required", label: "Rights ownership status", paths: ["ORIGINAL_ENTERTAINMENT"] },
  { key: "financingStatus", level: "recommended", label: "Financing status", paths: ["ORIGINAL_ENTERTAINMENT"] },
];

export function requirementsFor(paths: readonly ServicePath[]): IntakeRequirement[] {
  const selected = new Set(paths);
  return intakeRequirements.filter((requirement) => requirement.paths.some((path) => selected.has(path)));
}

export function calculateIntakeCompleteness(
  paths: readonly ServicePath[],
  answers: Record<string, unknown>,
) {
  const requirements = requirementsFor(paths);
  const complete = (key: string) => {
    const value = answers[key];
    return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && String(value).trim().length > 0;
  };
  const missingRequired = requirements.filter((item) => item.level === "required" && !complete(item.key));
  const missingRecommended = requirements.filter((item) => item.level === "recommended" && !complete(item.key));
  const required = requirements.filter((item) => item.level === "required");
  const score = required.length === 0 ? 100 : Math.round(((required.length - missingRequired.length) / required.length) * 100);
  return {
    score,
    missingRequired,
    missingRecommended,
    readyForEstimate: missingRequired.length === 0,
    readyForProduction: missingRequired.length === 0 && missingRecommended.length === 0,
  };
}
