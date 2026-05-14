import * as core from "@actions/core";
import { PRContext } from "./types";

export interface EnforceConfig {
  requireMilestone: boolean;
  requireAssignee: boolean;
  requireLinkedIssue: boolean;
  requireApprovals: number;
  blockDraftMerge: boolean;
  blockOnStale: boolean;
  staleDaysThreshold: number;
}

export interface EnforceResult {
  rule: string;
  passed: boolean;
  message: string;
}

export function evaluateEnforceRule(
  rule: string,
  passed: boolean,
  message: string
): EnforceResult {
  return { rule, passed, message };
}

export function runEnforceChecks(
  context: PRContext,
  config: EnforceConfig
): EnforceResult[] {
  const results: EnforceResult[] = [];

  if (config.requireMilestone) {
    results.push(
      evaluateEnforceRule(
        "require-milestone",
        context.milestone !== null && context.milestone !== undefined,
        context.milestone ? `Milestone set: ${context.milestone}` : "No milestone assigned"
      )
    );
  }

  if (config.requireAssignee) {
    const hasAssignee = Array.isArray(context.assignees) && context.assignees.length > 0;
    results.push(
      evaluateEnforceRule(
        "require-assignee",
        hasAssignee,
        hasAssignee ? `Assignees: ${context.assignees!.join(", ")}` : "No assignees set"
      )
    );
  }

  if (config.blockDraftMerge) {
    const isDraft = context.draft === true;
    results.push(
      evaluateEnforceRule(
        "block-draft",
        !isDraft,
        isDraft ? "PR is in draft state" : "PR is not a draft"
      )
    );
  }

  return results;
}

export function logEnforceResults(results: EnforceResult[]): void {
  for (const result of results) {
    if (result.passed) {
      core.info(`[enforce] ✅ ${result.rule}: ${result.message}`);
    } else {
      core.warning(`[enforce] ❌ ${result.rule}: ${result.message}`);
    }
  }
}
