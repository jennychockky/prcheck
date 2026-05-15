import * as core from "@actions/core";
import { PRContext } from "./types";

export interface MergeableConfig {
  requireMergeable: boolean;
  blockOnConflicts: boolean;
  allowDraft: boolean;
}

export interface MergeableResult {
  mergeable: boolean | null;
  mergeableState: string;
  isDraft: boolean;
  passed: boolean;
  reasons: string[];
}

export function checkMergeability(
  context: PRContext,
  config: MergeableConfig
): MergeableResult {
  const reasons: string[] = [];
  const { mergeable, mergeableState, isDraft } = context;

  if (!config.allowDraft && isDraft) {
    reasons.push("PR is still in draft state");
  }

  if (config.requireMergeable && mergeable === false) {
    reasons.push("PR has merge conflicts that must be resolved");
  }

  if (config.blockOnConflicts && mergeableState === "dirty") {
    reasons.push("PR branch is out of date or has conflicts");
  }

  if (config.blockOnConflicts && mergeableState === "blocked") {
    reasons.push("PR is blocked by branch protection rules");
  }

  return {
    mergeable: mergeable ?? null,
    mergeableState: mergeableState ?? "unknown",
    isDraft: isDraft ?? false,
    passed: reasons.length === 0,
    reasons,
  };
}

export function logMergeableResult(result: MergeableResult): void {
  if (result.passed) {
    core.info(`[mergeable] PR is mergeable (state: ${result.mergeableState})`);
  } else {
    for (const reason of result.reasons) {
      core.warning(`[mergeable] ${reason}`);
    }
  }
}

export function loadMergeableConfig(): MergeableConfig {
  return {
    requireMergeable: core.getInput("require_mergeable") !== "false",
    blockOnConflicts: core.getInput("block_on_conflicts") !== "false",
    allowDraft: core.getInput("allow_draft") === "true",
  };
}

export function runMergeableCheck(
  context: PRContext,
  config?: MergeableConfig
): MergeableResult {
  const cfg = config ?? loadMergeableConfig();
  const result = checkMergeability(context, cfg);
  logMergeableResult(result);
  return result;
}
