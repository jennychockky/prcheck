import * as core from "@actions/core";

import { checkDuplicatePR, DuplicateCheckResult, logDuplicateResult } from "./duplicate";
import { PRContext } from "./types";

export interface DuplicateConfig {
  enabled: boolean;
  threshold: number;
  failOnDuplicate: boolean;
}

export function loadDuplicateConfig(): DuplicateConfig {
  const enabled = core.getInput("duplicate_check_enabled") !== "false";
  const thresholdRaw = parseFloat(core.getInput("duplicate_threshold") || "0.8");
  const threshold = isNaN(thresholdRaw) ? 0.8 : Math.min(1, Math.max(0, thresholdRaw));
  const failOnDuplicate = core.getInput("duplicate_fail") === "true";

  return { enabled, threshold, failOnDuplicate };
}

export async function runDuplicateCheck(
  context: PRContext,
  openPRTitles: Array<{ number: number; title: string }>,
  config?: DuplicateConfig
): Promise<DuplicateCheckResult | null> {
  const cfg = config ?? loadDuplicateConfig();

  if (!cfg.enabled) {
    core.info("[duplicate] Duplicate check is disabled.");
    return null;
  }

  const result = checkDuplicatePR(context, openPRTitles, cfg.threshold);
  logDuplicateResult(result);

  if (!result.passed && cfg.failOnDuplicate) {
    core.setFailed(result.message);
  }

  return result;
}
