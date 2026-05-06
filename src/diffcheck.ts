import { DiffSummary, FileDiff } from './diff';
import { CheckResult } from './types';

export interface DiffCheckConfig {
  maxChangedFiles?: number;
  maxAdditions?: number;
  maxDeletions?: number;
  blockedPatterns?: string[];
}

export function checkDiffSize(
  summary: DiffSummary,
  config: DiffCheckConfig
): CheckResult {
  const issues: string[] = [];

  if (config.maxChangedFiles !== undefined && summary.totalFiles > config.maxChangedFiles) {
    issues.push(
      `PR changes ${summary.totalFiles} files, exceeds limit of ${config.maxChangedFiles}`
    );
  }

  if (config.maxAdditions !== undefined && summary.totalAdditions > config.maxAdditions) {
    issues.push(
      `PR adds ${summary.totalAdditions} lines, exceeds limit of ${config.maxAdditions}`
    );
  }

  if (config.maxDeletions !== undefined && summary.totalDeletions > config.maxDeletions) {
    issues.push(
      `PR deletes ${summary.totalDeletions} lines, exceeds limit of ${config.maxDeletions}`
    );
  }

  return {
    passed: issues.length === 0,
    messages: issues,
  };
}

export function checkBlockedFiles(
  files: FileDiff[],
  blockedPatterns: string[]
): CheckResult {
  const issues: string[] = [];

  for (const file of files) {
    for (const pattern of blockedPatterns) {
      if (new RegExp(pattern).test(file.filename)) {
        issues.push(`File "${file.filename}" matches blocked pattern "${pattern}"`);
      }
    }
  }

  return {
    passed: issues.length === 0,
    messages: issues,
  };
}
