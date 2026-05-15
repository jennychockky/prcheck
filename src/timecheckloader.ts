import * as core from "@actions/core";
import { PRContext } from "./types";
import {
  TimeCheckConfig,
  checkMergeWindow,
  logTimeCheckResult,
} from "./timecheck";

export function loadTimeCheckConfig(): TimeCheckConfig | null {
  const raw = core.getInput("merge_window");
  if (!raw || raw.trim() === "") return null;

  try {
    const parsed = JSON.parse(raw) as TimeCheckConfig;
    if (
      parsed.allowedHoursStart !== undefined &&
      parsed.allowedHoursEnd !== undefined &&
      parsed.allowedHoursStart >= parsed.allowedHoursEnd
    ) {
      core.warning(
        "merge_window: allowedHoursStart must be less than allowedHoursEnd. Skipping time check."
      );
      return null;
    }
    return parsed;
  } catch {
    core.warning("merge_window input is not valid JSON. Skipping time check.");
    return null;
  }
}

export function runTimeCheck(context: PRContext): boolean {
  const config = loadTimeCheckConfig();
  if (!config) {
    core.info("No merge_window config found. Skipping time check.");
    return true;
  }

  const result = checkMergeWindow(context, config);
  logTimeCheckResult(result);
  return result.passed || result.warnOnly;
}
