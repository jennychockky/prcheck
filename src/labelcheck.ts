import * as core from "@actions/core";
import { PRContext } from "./types";
import { checkLabels } from "./labels";

export interface LabelCheckConfig {
  required: string[];
  forbidden: string[];
  requireAtLeastOne: string[][];
  minCount: number;
  maxCount: number;
}

export function loadLabelConfig(): LabelCheckConfig {
  const required = core.getInput("required_labels")
    ? core.getInput("required_labels").split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const forbidden = core.getInput("forbidden_labels")
    ? core.getInput("forbidden_labels").split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const requireAtLeastOneRaw = core.getInput("require_one_of_labels");
  const requireAtLeastOne: string[][] = requireAtLeastOneRaw
    ? requireAtLeastOneRaw.split(";").map((group) =>
        group.split(",").map((s) => s.trim()).filter(Boolean)
      ).filter((g) => g.length > 0)
    : [];
  const minCount = parseInt(core.getInput("min_labels") || "0", 10);
  const maxCount = parseInt(core.getInput("max_labels") || "10", 10);
  return { required, forbidden, requireAtLeastOne, minCount, maxCount };
}

export interface LabelCheckResult {
  passed: boolean;
  missing: string[];
  forbidden: string[];
  unsatisfiedGroups: string[][];
  message: string;
}

export function runLabelCheck(
  context: PRContext,
  config: LabelCheckConfig
): LabelCheckResult {
  const labels = context.labels ?? [];
  const missing = config.required.filter((r) => !labels.includes(r));
  const forbidden = config.forbidden.filter((f) => labels.includes(f));
  const unsatisfiedGroups = config.requireAtLeastOne.filter(
    (group) => !group.some((l) => labels.includes(l))
  );
  const belowMin = labels.length < config.minCount;
  const aboveMax = labels.length > config.maxCount;

  const issues: string[] = [];
  if (missing.length > 0) issues.push(`Missing required labels: ${missing.join(", ")}`);
  if (forbidden.length > 0) issues.push(`Forbidden labels present: ${forbidden.join(", ")}`);
  if (unsatisfiedGroups.length > 0)
    issues.push(
      `Must include at least one of: ${unsatisfiedGroups.map((g) => `[${g.join(", ")}]`).join("; ")}`
    );
  if (belowMin) issues.push(`PR has ${labels.length} label(s), minimum is ${config.minCount}`);
  if (aboveMax) issues.push(`PR has ${labels.length} label(s), maximum is ${config.maxCount}`);

  const passed = issues.length === 0;
  return {
    passed,
    missing,
    forbidden,
    unsatisfiedGroups,
    message: passed ? "All label checks passed" : issues.join("; "),
  };
}
