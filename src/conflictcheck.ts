import * as core from "@actions/core";

import { checkMergeConflicts, logConflictResult } from "./conflict";
import { PRContext } from "./types";

export interface ConflictCheckConfig {
  enabled: boolean;
  failOnUnknown: boolean;
}

export function loadConflictConfig(): ConflictCheckConfig {
  const enabled = core.getInput("conflict_check") !== "false";
  const failOnUnknown = core.getInput("conflict_fail_on_unknown") === "true";
  return { enabled, failOnUnknown };
}

export function runConflictCheck(
  context: PRContext,
  config: ConflictCheckConfig
): boolean {
  if (!config.enabled) {
    core.info("[conflict] Conflict check is disabled.");
    return true;
  }

  const result = checkMergeConflicts(context);
  logConflictResult(result);

  if (result.hasConflicts) {
    core.setFailed(result.message);
    return false;
  }

  const isUnknown =
    result.mergeableState === null ||
    result.mergeableState === "unknown";

  if (isUnknown && config.failOnUnknown) {
    core.setFailed(
      "[conflict] Merge conflict status is unknown and fail_on_unknown is enabled."
    );
    return false;
  }

  return true;
}
