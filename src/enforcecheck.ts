import * as core from "@actions/core";
import { EnforceConfig, runEnforceChecks, logEnforceResults } from "./enforce";
import { PRContext } from "./types";

export function loadEnforceConfig(): EnforceConfig {
  return {
    requireMilestone: core.getInput("require_milestone") === "true",
    requireAssignee: core.getInput("require_assignee") === "true",
    requireLinkedIssue: core.getInput("require_linked_issue") === "true",
    requireApprovals: parseInt(core.getInput("require_approvals") || "0", 10),
    blockDraftMerge: core.getInput("block_draft_merge") === "true",
    blockOnStale: core.getInput("block_on_stale") === "true",
    staleDaysThreshold: parseInt(core.getInput("stale_days_threshold") || "30", 10),
  };
}

export function runEnforceCheck(
  context: PRContext,
  config?: EnforceConfig
): { passed: boolean; failures: string[] } {
  const cfg = config ?? loadEnforceConfig();
  const results = runEnforceChecks(context, cfg);
  logEnforceResults(results);

  const failures = results
    .filter((r) => !r.passed)
    .map((r) => `${r.rule}: ${r.message}`);

  return {
    passed: failures.length === 0,
    failures,
  };
}
