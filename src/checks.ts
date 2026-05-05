import { CheckResult } from './types';

export interface PRCheckInput {
  title: string;
  description: string;
  labels: string[];
  requiredLabels: string[];
  requiredSections: string[];
  titlePattern?: string;
}

export interface PRCheckOutput {
  passed: boolean;
  results: CheckResult[];
  summary: string;
}

export function checkTitle(title: string, pattern?: string): CheckResult {
  if (!pattern) {
    return { name: 'title', passed: true, message: 'No title pattern configured' };
  }
  const regex = new RegExp(pattern);
  const passed = regex.test(title);
  return {
    name: 'title',
    passed,
    message: passed
      ? 'Title matches required pattern'
      : `Title does not match required pattern: ${pattern}`,
  };
}

export function checkLabels(labels: string[], requiredLabels: string[]): CheckResult {
  if (requiredLabels.length === 0) {
    return { name: 'labels', passed: true, message: 'No required labels configured' };
  }
  const missing = requiredLabels.filter((l) => !labels.includes(l));
  const passed = missing.length === 0;
  return {
    name: 'labels',
    passed,
    message: passed
      ? 'All required labels are present'
      : `Missing required labels: ${missing.join(', ')}`,
  };
}

export function runChecks(input: PRCheckInput): PRCheckOutput {
  const results: CheckResult[] = [];

  results.push(checkTitle(input.title, input.titlePattern));
  results.push(checkLabels(input.labels, input.requiredLabels));

  const passed = results.every((r) => r.passed);
  const failed = results.filter((r) => !r.passed);
  const summary = passed
    ? 'All PR checks passed'
    : `${failed.length} check(s) failed: ${failed.map((r) => r.name).join(', ')}`;

  return { passed, results, summary };
}
