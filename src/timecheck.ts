import * as core from "@actions/core";
import { PRContext } from "./types";

export interface TimeCheckConfig {
  allowedDays?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  allowedHoursStart?: number; // 0-23
  allowedHoursEnd?: number; // 0-23
  timezone?: string;
  warnOnly?: boolean;
}

export interface TimeCheckResult {
  passed: boolean;
  day: number;
  hour: number;
  message: string;
  warnOnly: boolean;
}

export function getCurrentTime(timezone?: string): Date {
  if (!timezone) return new Date();
  try {
    const now = new Date();
    const localeStr = now.toLocaleString("en-US", { timeZone: timezone });
    return new Date(localeStr);
  } catch {
    core.warning(`Invalid timezone "${timezone}", falling back to UTC.`);
    return new Date();
  }
}

export function checkMergeWindow(
  context: PRContext,
  config: TimeCheckConfig
): TimeCheckResult {
  const now = getCurrentTime(config.timezone);
  const day = now.getDay();
  const hour = now.getHours();
  const warnOnly = config.warnOnly ?? false;

  if (config.allowedDays && !config.allowedDays.includes(day)) {
    return {
      passed: false,
      day,
      hour,
      message: `PR #${context.prNumber} merge attempted on a restricted day (day=${day}).`,
      warnOnly,
    };
  }

  if (
    config.allowedHoursStart !== undefined &&
    config.allowedHoursEnd !== undefined
  ) {
    const inWindow =
      hour >= config.allowedHoursStart && hour < config.allowedHoursEnd;
    if (!inWindow) {
      return {
        passed: false,
        day,
        hour,
        message: `PR #${context.prNumber} merge attempted outside allowed hours (${config.allowedHoursStart}:00–${config.allowedHoursEnd}:00), current hour=${hour}.`,
        warnOnly,
      };
    }
  }

  return {
    passed: true,
    day,
    hour,
    message: `PR #${context.prNumber} is within the allowed merge window.`,
    warnOnly,
  };
}

export function logTimeCheckResult(result: TimeCheckResult): void {
  if (result.passed) {
    core.info(`✅ Merge window check passed: ${result.message}`);
  } else if (result.warnOnly) {
    core.warning(`⚠️ Merge window check (warn-only): ${result.message}`);
  } else {
    core.setFailed(`❌ Merge window check failed: ${result.message}`);
  }
}
