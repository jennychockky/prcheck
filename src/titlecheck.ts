import * as core from '@actions/core';
import { CheckResult } from './types';

export interface TitleCheckConfig {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  forbiddenPrefixes?: string[];
}

export function checkTitlePattern(title: string, pattern: string): CheckResult {
  const regex = new RegExp(pattern);
  if (!regex.test(title)) {
    return {
      passed: false,
      message: `PR title does not match required pattern: ${pattern}`,
    };
  }
  return { passed: true, message: 'PR title matches required pattern' };
}

export function checkTitleLength(
  title: string,
  minLength?: number,
  maxLength?: number
): CheckResult {
  if (minLength !== undefined && title.length < minLength) {
    return {
      passed: false,
      message: `PR title is too short (${title.length} < ${minLength})`,
    };
  }
  if (maxLength !== undefined && title.length > maxLength) {
    return {
      passed: false,
      message: `PR title is too long (${title.length} > ${maxLength})`,
    };
  }
  return { passed: true, message: 'PR title length is acceptable' };
}

export function checkForbiddenPrefixes(
  title: string,
  forbiddenPrefixes: string[]
): CheckResult {
  for (const prefix of forbiddenPrefixes) {
    if (title.toLowerCase().startsWith(prefix.toLowerCase())) {
      return {
        passed: false,
        message: `PR title starts with forbidden prefix: "${prefix}"`,
      };
    }
  }
  return { passed: true, message: 'PR title has no forbidden prefixes' };
}

export function runTitleChecks(
  title: string,
  config: TitleCheckConfig
): CheckResult[] {
  const results: CheckResult[] = [];

  if (config.pattern) {
    results.push(checkTitlePattern(title, config.pattern));
  }

  if (config.minLength !== undefined || config.maxLength !== undefined) {
    results.push(checkTitleLength(title, config.minLength, config.maxLength));
  }

  if (config.forbiddenPrefixes && config.forbiddenPrefixes.length > 0) {
    results.push(checkForbiddenPrefixes(title, config.forbiddenPrefixes));
  }

  const failed = results.filter((r) => !r.passed);
  if (failed.length > 0) {
    failed.forEach((r) => core.warning(r.message));
  } else {
    core.info('All title checks passed');
  }

  return results;
}
