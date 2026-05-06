import * as core from '@actions/core';

export interface StaleCheckConfig {
  maxDaysWithoutUpdate: number;
  warnDaysWithoutUpdate?: number;
}

export interface StaleCheckResult {
  isStale: boolean;
  isWarning: boolean;
  daysSinceUpdate: number;
  lastUpdatedAt: string;
  message: string;
}

export function getDaysSinceUpdate(updatedAt: string): number {
  const updated = new Date(updatedAt).getTime();
  const now = Date.now();
  const diffMs = now - updated;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function checkStalePR(
  updatedAt: string,
  config: StaleCheckConfig
): StaleCheckResult {
  const days = getDaysSinceUpdate(updatedAt);
  const warnThreshold = config.warnDaysWithoutUpdate ?? config.maxDaysWithoutUpdate;
  const isStale = days >= config.maxDaysWithoutUpdate;
  const isWarning = !isStale && days >= warnThreshold;

  let message: string;
  if (isStale) {
    message = `PR has not been updated in ${days} day(s), exceeding the limit of ${config.maxDaysWithoutUpdate} day(s).`;
  } else if (isWarning) {
    message = `PR has not been updated in ${days} day(s). Consider updating soon (limit: ${config.maxDaysWithoutUpdate} day(s)).`;
  } else {
    message = `PR was last updated ${days} day(s) ago. Within acceptable range.`;
  }

  return { isStale, isWarning, daysSinceUpdate: days, lastUpdatedAt: updatedAt, message };
}

export function logStaleResult(result: StaleCheckResult): void {
  if (result.isStale) {
    core.error(`[stale] ${result.message}`);
  } else if (result.isWarning) {
    core.warning(`[stale] ${result.message}`);
  } else {
    core.info(`[stale] ${result.message}`);
  }
}
