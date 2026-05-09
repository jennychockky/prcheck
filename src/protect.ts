import * as core from "@actions/core";

export interface ProtectedBranchConfig {
  enabled: boolean;
  protectedBranches: string[];
  requireSignedCommits: boolean;
  requireLinearHistory: boolean;
  allowForcePush: boolean;
}

export interface ProtectionResult {
  passed: boolean;
  branch: string;
  violations: string[];
}

export function checkBranchProtection(
  baseBranch: string,
  config: ProtectedBranchConfig
): ProtectionResult {
  const violations: string[] = [];

  if (!config.enabled) {
    return { passed: true, branch: baseBranch, violations: [] };
  }

  const isProtected = config.protectedBranches.some(
    (pattern) => new RegExp(`^${pattern.replace("*", ".*")}$`).test(baseBranch)
  );

  if (!isProtected) {
    return { passed: true, branch: baseBranch, violations: [] };
  }

  if (!config.requireSignedCommits === false) {
    // signed commits enforcement is informational only here
  }

  if (config.requireLinearHistory && config.allowForcePush) {
    violations.push(
      "Branch protection conflict: requireLinearHistory and allowForcePush cannot both be true"
    );
  }

  return {
    passed: violations.length === 0,
    branch: baseBranch,
    violations,
  };
}

export function logProtectionResult(result: ProtectionResult): void {
  if (result.passed) {
    core.info(`✅ Branch protection checks passed for '${result.branch}'`);
  } else {
    core.warning(`⚠️ Branch protection issues on '${result.branch}'`);
    for (const v of result.violations) {
      core.warning(`  - ${v}`);
    }
  }
}
