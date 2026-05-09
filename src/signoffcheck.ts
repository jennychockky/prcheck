import * as core from "@actions/core";
import { checkSignoffs, logSignoffResult, SignoffConfig } from "./signoff";

export function loadSignoffConfig(): SignoffConfig {
  const required = core.getInput("signoff_required") === "true";
  const patternsRaw = core.getInput("signoff_patterns");
  const patterns = patternsRaw
    ? patternsRaw.split("\n").map((p) => p.trim()).filter(Boolean)
    : [];
  const minCount = parseInt(core.getInput("signoff_min_count") || "1", 10);

  return { required, patterns, minCount };
}

export function runSignoffCheck(
  commitMessages: string[],
  config?: SignoffConfig
): boolean {
  const resolvedConfig = config ?? loadSignoffConfig();

  if (!resolvedConfig.required) {
    core.info("ℹ️ Signoff check is disabled.");
    return true;
  }

  const result = checkSignoffs(commitMessages, resolvedConfig);
  logSignoffResult(result);

  if (!result.signed) {
    core.setFailed("Signoff check failed: missing required signoffs in commits.");
    return false;
  }

  return true;
}
