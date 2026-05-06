import * as core from "@actions/core";
import { PRContext } from "./types";
import {
  ReviewerConfig,
  ReviewerResult,
  checkRequiredReviewers,
  checkMinReviewers,
  logReviewerResult
} from "./reviewers";

export interface ReviewerCheckSummary {
  passed: boolean;
  results: ReviewerResult[];
}

export function runReviewerChecks(
  context: PRContext,
  config: ReviewerConfig
): ReviewerCheckSummary {
  const results: ReviewerResult[] = [];

  if (config.requiredReviewers && config.requiredReviewers.length > 0) {
    const result = checkRequiredReviewers(context, config);
    logReviewerResult(result);
    results.push(result);
  }

  if (config.minReviewers !== undefined && config.minReviewers > 0) {
    const result = checkMinReviewers(context, config);
    logReviewerResult(result);
    results.push(result);
  }

  const passed = results.every((r) => r.passed);

  if (results.length === 0) {
    core.info("ℹ️ No reviewer checks configured");
  }

  return { passed, results };
}
