import * as core from "@actions/core";
import { PRContext } from "./types";
import { checkDraftStatus, logDraftResult, DraftCheckResult } from "./draft";

export interface DraftCheckConfig {
  blockDraft: boolean;
}

/**
 * Loads draft-check configuration from action inputs.
 */
export function loadDraftConfig(): DraftCheckConfig {
  const blockDraft = core.getInput("block_draft").toLowerCase() !== "false";
  return { blockDraft };
}

/**
 * Runs the draft status check and returns the result.
 */
export function runDraftCheck(
  context: PRContext,
  config: DraftCheckConfig
): DraftCheckResult {
  const result = checkDraftStatus(context, config.blockDraft);
  logDraftResult(result);
  return result;
}
