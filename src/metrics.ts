import * as core from '@actions/core';
import { CheckResult } from './types';

export interface PRMetrics {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  skippedChecks: number;
  passRate: number;
  checkNames: string[];
  failedCheckNames: string[];
}

export function computeMetrics(results: CheckResult[]): PRMetrics {
  const totalChecks = results.length;
  const passedChecks = results.filter((r) => r.status === 'pass').length;
  const failedChecks = results.filter((r) => r.status === 'fail').length;
  const skippedChecks = results.filter((r) => r.status === 'skip').length;
  const passRate = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
  const checkNames = results.map((r) => r.name);
  const failedCheckNames = results.filter((r) => r.status === 'fail').map((r) => r.name);

  return {
    totalChecks,
    passedChecks,
    failedChecks,
    skippedChecks,
    passRate,
    checkNames,
    failedCheckNames,
  };
}

export function logMetrics(metrics: PRMetrics): void {
  core.info(`PR Check Metrics:`);
  core.info(`  Total checks : ${metrics.totalChecks}`);
  core.info(`  Passed       : ${metrics.passedChecks}`);
  core.info(`  Failed       : ${metrics.failedChecks}`);
  core.info(`  Skipped      : ${metrics.skippedChecks}`);
  core.info(`  Pass rate    : ${metrics.passRate}%`);

  if (metrics.failedCheckNames.length > 0) {
    core.warning(`Failed checks: ${metrics.failedCheckNames.join(', ')}`);
  }
}

export function exportMetricOutputs(metrics: PRMetrics): void {
  core.setOutput('total_checks', String(metrics.totalChecks));
  core.setOutput('passed_checks', String(metrics.passedChecks));
  core.setOutput('failed_checks', String(metrics.failedChecks));
  core.setOutput('pass_rate', String(metrics.passRate));
}
