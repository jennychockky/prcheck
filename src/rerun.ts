import * as core from "@actions/core";

export interface RerunConfig {
  enabled: boolean;
  maxAttempts: number;
  triggerOnLabels: string[];
}

export interface RerunContext {
  labels: string[];
  runAttempt: number;
  runId: string;
}

export interface RerunResult {
  shouldRerun: boolean;
  reason: string;
  attempt: number;
  maxAttempts: number;
}

export function checkRerunEligibility(
  config: RerunConfig,
  context: RerunContext
): RerunResult {
  if (!config.enabled) {
    return { shouldRerun: false, reason: "rerun disabled", attempt: context.runAttempt, maxAttempts: config.maxAttempts };
  }

  if (context.runAttempt >= config.maxAttempts) {
    return {
      shouldRerun: false,
      reason: `max attempts (${config.maxAttempts}) reached`,
      attempt: context.runAttempt,
      maxAttempts: config.maxAttempts,
    };
  }

  const matchedLabel = config.triggerOnLabels.find((label) =>
    context.labels.includes(label)
  );

  if (!matchedLabel) {
    return {
      shouldRerun: false,
      reason: "no matching trigger label found",
      attempt: context.runAttempt,
      maxAttempts: config.maxAttempts,
    };
  }

  return {
    shouldRerun: true,
    reason: `label "${matchedLabel}" triggered rerun`,
    attempt: context.runAttempt,
    maxAttempts: config.maxAttempts,
  };
}

export function logRerunResult(result: RerunResult): void {
  if (result.shouldRerun) {
    core.info(`[rerun] Rerun triggered: ${result.reason} (attempt ${result.attempt}/${result.maxAttempts})`);
  } else {
    core.info(`[rerun] No rerun: ${result.reason}`);
  }
}
