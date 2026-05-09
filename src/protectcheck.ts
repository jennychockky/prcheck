import * as core from "@actions/core";
import {
  checkBranchProtection,
  logProtectionResult,
  ProtectedBranchConfig,
  ProtectionResult,
} from "./protect";

export function loadProtectConfig(): ProtectedBranchConfig {
  const raw = core.getInput("protected_branches");
  const branches = raw
    ? raw.split(",").map((b) => b.trim()).filter(Boolean)
    : ["main", "master"];

  return {
    enabled: core.getInput("check_branch_protection") !== "false",
    protectedBranches: branches,
    requireSignedCommits:
      core.getInput("require_signed_commits") === "true",
    requireLinearHistory:
      core.getInput("require_linear_history") === "true",
    allowForcePush:
      core.getInput("allow_force_push") === "true",
  };
}

export function runProtectionCheck(
  baseBranch: string,
  config?: ProtectedBranchConfig
): ProtectionResult {
  const cfg = config ?? loadProtectConfig();
  const result = checkBranchProtection(baseBranch, cfg);
  logProtectionResult(result);

  if (!result.passed) {
    core.setFailed(
      `Branch protection check failed for '${baseBranch}': ${result.violations.join("; ")}`
    );
  }

  return result;
}
