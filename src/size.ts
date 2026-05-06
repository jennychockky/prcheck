import * as core from '@actions/core';

import { PRContext } from './types';

export interface SizeConfig {
  maxAdditions?: number;
  maxDeletions?: number;
  maxChangedFiles?: number;
  warnOnly?: boolean;
}

export interface SizeResult {
  passed: boolean;
  warnings: string[];
  errors: string[];
}

export function categorizePRSize(additions: number, deletions: number): string {
  const total = additions + deletions;
  if (total <= 10) return 'XS';
  if (total <= 50) return 'S';
  if (total <= 250) return 'M';
  if (total <= 1000) return 'L';
  return 'XL';
}

export function checkPRSize(
  context: PRContext,
  config: SizeConfig
): SizeResult {
  const result: SizeResult = { passed: true, warnings: [], errors: [] };
  const { additions, deletions, changedFiles } = context;

  if (config.maxAdditions !== undefined && additions > config.maxAdditions) {
    const msg = `PR has ${additions} additions, exceeds limit of ${config.maxAdditions}`;
    config.warnOnly ? result.warnings.push(msg) : result.errors.push(msg);
  }

  if (config.maxDeletions !== undefined && deletions > config.maxDeletions) {
    const msg = `PR has ${deletions} deletions, exceeds limit of ${config.maxDeletions}`;
    config.warnOnly ? result.warnings.push(msg) : result.errors.push(msg);
  }

  if (
    config.maxChangedFiles !== undefined &&
    changedFiles > config.maxChangedFiles
  ) {
    const msg = `PR touches ${changedFiles} files, exceeds limit of ${config.maxChangedFiles}`;
    config.warnOnly ? result.warnings.push(msg) : result.errors.push(msg);
  }

  if (result.errors.length > 0) {
    result.passed = false;
  }

  return result;
}

export function logSizeResult(result: SizeResult, size: string): void {
  core.info(`PR size category: ${size}`);
  result.warnings.forEach((w) => core.warning(w));
  result.errors.forEach((e) => core.error(e));
}
