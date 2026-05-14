import * as core from "@actions/core";

import { PRContext } from "./types";

export interface AutoCloseConfig {
  enabled: boolean;
  staleDays: number;
  draftDays?: number;
  label?: string;
  comment?: string;
}

export interface AutoCloseResult {
  shouldClose: boolean;
  reason?: string;
  daysSinceUpdate: number;
  isDraft: boolean;
}

export function checkAutoClose(
  context: PRContext,
  config: AutoCloseConfig,
  now: Date = new Date()
): AutoCloseResult {
  const updatedAt = new Date(context.updatedAt ?? context.createdAt);
  const ms = now.getTime() - updatedAt.getTime();
  const daysSinceUpdate = Math.floor(ms / (1000 * 60 * 60 * 24));
  const isDraft = context.draft ?? false;

  if (!config.enabled) {
    return { shouldClose: false, daysSinceUpdate, isDraft };
  }

  if (isDraft && config.draftDays !== undefined) {
    if (daysSinceUpdate >= config.draftDays) {
      return {
        shouldClose: true,
        reason: `Draft PR has been inactive for ${daysSinceUpdate} days (limit: ${config.draftDays})`,
        daysSinceUpdate,
        isDraft,
      };
    }
  }

  if (daysSinceUpdate >= config.staleDays) {
    return {
      shouldClose: true,
      reason: `PR has been inactive for ${daysSinceUpdate} days (limit: ${config.staleDays})`,
      daysSinceUpdate,
      isDraft,
    };
  }

  return { shouldClose: false, daysSinceUpdate, isDraft };
}

export function logAutoCloseResult(result: AutoCloseResult): void {
  if (result.shouldClose) {
    core.warning(`Auto-close triggered: ${result.reason}`);
  } else {
    core.info(
      `Auto-close: not triggered (${result.daysSinceUpdate} days inactive, draft=${result.isDraft})`
    );
  }
}
