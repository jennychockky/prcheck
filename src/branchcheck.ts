import * as core from "@actions/core";
import { checkBranchName, getHeadBranch, getBaseBranch } from "./branch";
import type { CheckResult } from "./types";

export interface BranchCheckConfig {
  headPattern?: string;
  basePattern?: string;
}

/**
 * Runs branch name checks for head and/or base branches.
 */
export function runBranchChecks(
  payload: Record<string, unknown>,
  config: BranchCheckConfig
): CheckResult[] {
  const results: CheckResult[] = [];

  const headBranch = getHeadBranch(payload);
  const baseBranch = getBaseBranch(payload);

  if (config.headPattern) {
    const result = checkBranchName(headBranch, config.headPattern);
    results.push({
      name: "branch-head",
      passed: result.passed,
      message: result.message,
    });
    if (!result.passed) {
      core.error(`[branch-head] ${result.message}`);
    } else {
      core.info(`[branch-head] ${result.message}`);
    }
  }

  if (config.basePattern) {
    const result = checkBranchName(baseBranch, config.basePattern);
    results.push({
      name: "branch-base",
      passed: result.passed,
      message: result.message,
    });
    if (!result.passed) {
      core.error(`[branch-base] ${result.message}`);
    } else {
      core.info(`[branch-base] ${result.message}`);
    }
  }

  return results;
}
