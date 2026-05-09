import * as core from "@actions/core";

export interface FileSizeConfig {
  maxFileSizeKb?: number;
  blockedExtensions?: string[];
  warnFileSizeKb?: number;
}

export interface FileSizeResult {
  passed: boolean;
  warnings: string[];
  errors: string[];
  checkedFiles: number;
}

export interface ChangedFile {
  filename: string;
  additions: number;
  deletions: number;
  changes: number;
  status: string;
  size?: number; // bytes
}

export function checkFileSizes(
  files: ChangedFile[],
  config: FileSizeConfig
): FileSizeResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const maxBytes = (config.maxFileSizeKb ?? 500) * 1024;
  const warnBytes = (config.warnFileSizeKb ?? 200) * 1024;
  const blocked = config.blockedExtensions ?? [];

  for (const file of files) {
    const ext = file.filename.split(".").pop() ?? "";
    if (blocked.includes(ext)) {
      errors.push(`File "${file.filename}" has blocked extension ".${ext}"`);
    }

    if (file.size !== undefined) {
      if (file.size > maxBytes) {
        errors.push(
          `File "${file.filename}" exceeds max size (${(file.size / 1024).toFixed(1)} KB > ${config.maxFileSizeKb ?? 500} KB)`
        );
      } else if (file.size > warnBytes) {
        warnings.push(
          `File "${file.filename}" is large (${(file.size / 1024).toFixed(1)} KB)`
        );
      }
    }
  }

  return {
    passed: errors.length === 0,
    warnings,
    errors,
    checkedFiles: files.length,
  };
}

export function logFileSizeResult(result: FileSizeResult): void {
  core.info(`File size check: ${result.checkedFiles} file(s) checked`);
  for (const warn of result.warnings) {
    core.warning(warn);
  }
  for (const err of result.errors) {
    core.error(err);
  }
  if (result.passed) {
    core.info("File size check passed.");
  } else {
    core.setFailed("File size check failed.");
  }
}
