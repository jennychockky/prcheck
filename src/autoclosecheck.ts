import * as core from "@actions/core";

import { checkAutoClose, AutoCloseConfig, logAutoCloseResult } from "./autoclose";
import { PRContext } from "./types";

export function loadAutoCloseConfig(): AutoCloseConfig {
  const enabled = core.getInput("autoclose_enabled") !== "false";
  const staleDays = parseInt(core.getInput("autoclose_stale_days") || "60", 10);
  const draftDaysRaw = core.getInput("autoclose_draft_days");
  const draftDays = draftDaysRaw ? parseInt(draftDaysRaw, 10) : undefined;
  const label = core.getInput("autoclose_label") || undefined;
  const comment =
    core.getInput("autoclose_comment") ||
    "This PR has been automatically flagged for closure due to inactivity.";

  return { enabled, staleDays, draftDays, label, comment };
}

export function runAutoCloseCheck(
  context: PRContext,
  config?: AutoCloseConfig
): boolean {
  const resolvedConfig = config ?? loadAutoCloseConfig();
  const result = checkAutoClose(context, resolvedConfig);
  logAutoCloseResult(result);

  if (result.shouldClose) {
    core.setOutput("autoclose_triggered", "true");
    core.setOutput("autoclose_reason", result.reason ?? "");
    return false;
  }

  core.setOutput("autoclose_triggered", "false");
  core.setOutput("autoclose_reason", "");
  return true;
}
