import * as core from "@actions/core";
import { PRContext } from "./types";

export interface DraftCheckResult {
  isDraft: boolean;
  blocked: boolean;
  message: string;
}

/**
 * Checks whether a PR is in draft state.
 */
export function checkDraftStatus(
  context: PRContext,
  blockDraft: boolean
): DraftCheckResult {
  const isDraft = context.draft === true;

  if (isDraft && blockDraft) {
    return {
      isDraft,
      blocked: true,
      message: "PR is still in draft state and cannot be merged.",
    };
  }

  if (isDraft && !blockDraft) {
    return {
      isDraft,
      blocked: false,
      message: "PR is in draft state (allowed by configuration).",
    };
  }

  return {
    isDraft: false,
    blocked: false,
    message: "PR is ready for review.",
  };
}

/**
 * Logs the draft check result to the Actions console.
 */
export function logDraftResult(result: DraftCheckResult): void {
  if (result.blocked) {
    core.warning(`[draft] ${result.message}`);
  } else if (result.isDraft) {
    core.info(`[draft] ${result.message}`);
  } else {
    core.info(`[draft] ${result.message}`);
  }
}
