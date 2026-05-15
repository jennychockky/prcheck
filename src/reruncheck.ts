import * as core from "@actions/core";
import { RerunConfig, RerunContext, checkRerunEligibility, logRerunResult } from "./rerun";

export function loadRerunConfig(): RerunConfig {
  const enabled = core.getInput("rerun_enabled") !== "false";
  const maxAttempts = parseInt(core.getInput("rerun_max_attempts") || "3", 10);
  const triggerOnLabelsRaw = core.getInput("rerun_trigger_labels") || "rerun,retry";
  const triggerOnLabels = triggerOnLabelsRaw
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);

  return { enabled, maxAttempts, triggerOnLabels };
}

export function runRerunCheck(
  config: RerunConfig,
  context: RerunContext
): boolean {
  const result = checkRerunEligibility(config, context);
  logRerunResult(result);

  if (result.shouldRerun) {
    core.setOutput("rerun_triggered", "true");
    core.setOutput("rerun_reason", result.reason);
  } else {
    core.setOutput("rerun_triggered", "false");
    core.setOutput("rerun_reason", result.reason);
  }

  return result.shouldRerun;
}
