import * as core from "@actions/core";
import { PRContext } from "./types";

export interface ReviewerConfig {
  requiredReviewers?: string[];
  minReviewers?: number;
  requireTeamReview?: boolean;
  requiredTeams?: string[];
}

export interface ReviewerResult {
  passed: boolean;
  requested: string[];
  missing: string[];
  message: string;
}

export function checkRequiredReviewers(
  context: PRContext,
  config: ReviewerConfig
): ReviewerResult {
  const requested = context.reviewers ?? [];
  const required = config.requiredReviewers ?? [];
  const missing = required.filter((r) => !requested.includes(r));

  if (missing.length > 0) {
    return {
      passed: false,
      requested,
      missing,
      message: `Missing required reviewers: ${missing.join(", ")}`
    };
  }

  return { passed: true, requested, missing: [], message: "All required reviewers assigned" };
}

export function checkMinReviewers(
  context: PRContext,
  config: ReviewerConfig
): ReviewerResult {
  const requested = context.reviewers ?? [];
  const min = config.minReviewers ?? 0;

  if (requested.length < min) {
    return {
      passed: false,
      requested,
      missing: [],
      message: `At least ${min} reviewer(s) required, found ${requested.length}`
    };
  }

  return { passed: true, requested, missing: [], message: `Reviewer count satisfied (${requested.length})` };
}

export function logReviewerResult(result: ReviewerResult): void {
  if (result.passed) {
    core.info(`✅ Reviewers: ${result.message}`);
  } else {
    core.warning(`❌ Reviewers: ${result.message}`);
  }
}
