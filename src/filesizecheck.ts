import * as core from "@actions/core";
import { checkFileSizes, logFileSizeResult, FileSizeConfig, ChangedFile } from "./filesize";

export function loadFileSizeConfig(): FileSizeConfig {
  const maxFileSizeKb = parseInt(core.getInput("max_file_size_kb") || "500", 10);
  const warnFileSizeKb = parseInt(core.getInput("warn_file_size_kb") || "200", 10);
  const blockedRaw = core.getInput("blocked_extensions") || "";
  const blockedExtensions = blockedRaw
    .split(",")
    .map((e) => e.trim().replace(/^\./, ""))
    .filter(Boolean);

  return { maxFileSizeKb, warnFileSizeKb, blockedExtensions };
}

export function runFileSizeCheck(files: ChangedFile[]): boolean {
  const config = loadFileSizeConfig();
  const result = checkFileSizes(files, config);
  logFileSizeResult(result);
  return result.passed;
}
