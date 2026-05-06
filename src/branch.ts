import * as core from "@actions/core";

export interface BranchCheckResult {
  passed: boolean;
  branchName: string;
  message: string;
}

/**
 * Checks whether a branch name matches the required pattern.
 */
export function checkBranchName(
  branchName: string,
  pattern: string
): BranchCheckResult {
  if (!pattern) {
    return { passed: true, branchName, message: "No branch pattern configured." };
  }

  let regex: RegExp;
  try {
    regex = new RegExp(pattern);
  } catch (err) {
    core.warning(`Invalid branch pattern "${pattern}": ${(err as Error).message}`);
    return { passed: true, branchName, message: "Invalid pattern — check skipped." };
  }

  const passed = regex.test(branchName);
  const message = passed
    ? `Branch "${branchName}" matches pattern "${pattern}".`
    : `Branch "${branchName}" does not match required pattern "${pattern}".`;

  return { passed, branchName, message };
}

/**
 * Returns the base (target) branch of the PR.
 */
export function getBaseBranch(payload: Record<string, unknown>): string {
  const pr = payload?.pull_request as Record<string, unknown> | undefined;
  return (pr?.base as Record<string, unknown>)?.ref as string ?? "";
}

/**
 * Returns the head (source) branch of the PR.
 */
export function getHeadBranch(payload: Record<string, unknown>): string {
  const pr = payload?.pull_request as Record<string, unknown> | undefined;
  return (pr?.head as Record<string, unknown>)?.ref as string ?? "";
}
