import * as core from "@actions/core";

import { PRContext } from "./types";

export interface ConflictResult {
  hasConflicts: boolean;
  mergeableState: string | null;
  message: string;
}

export function checkMergeConflicts(context: PRContext): ConflictResult {
  const { mergeable, mergeable_state } = context.pull_request as {
    mergeable?: boolean | null;
    mergeable_state?: string;
  };

  const state = mergeable_state ?? null;

  if (mergeable === false) {
    return {
      hasConflicts: true,
      mergeableState: state,
      message: `PR has merge conflicts (state: ${state ?? "unknown"}). Please resolve before merging.`,
    };
  }

  if (mergeable === null || mergeable === undefined) {
    return {
      hasConflicts: false,
      mergeableState: state,
      message: `Merge conflict status is unknown (state: ${state ?? "unknown"}). GitHub may still be computing mergeability.`,
    };
  }

  return {
    hasConflicts: false,
    mergeableState: state,
    message: `No merge conflicts detected (state: ${state ?? "clean"}).`,
  };
}

export function logConflictResult(result: ConflictResult): void {
  if (result.hasConflicts) {
    core.error(`[conflict] ${result.message}`);
  } else {
    core.info(`[conflict] ${result.message}`);
  }
}
