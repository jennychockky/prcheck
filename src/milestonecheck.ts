import * as core from '@actions/core';
import { runMilestoneChecks } from './milestone';
import { MilestoneConfig, MilestoneResult } from './types';

/**
 * Evaluate milestone results and report via core outputs.
 */
export function evaluateMilestoneResults(results: MilestoneResult[]): {
  passed: boolean;
  failures: string[];
} {
  const failures = results
    .filter((r) => !r.passed)
    .map((r) => r.message);

  return { passed: failures.length === 0, failures };
}

/**
 * Main entry point for milestone enforcement in the action.
 */
export async function runMilestoneEnforcement(
  milestone: { title: string; number: number } | null | undefined,
  config: MilestoneConfig
): Promise<boolean> {
  const results = runMilestoneChecks(milestone, config);
  const { passed, failures } = evaluateMilestoneResults(results);

  for (const result of results) {
    if (result.passed) {
      core.info(`✅ ${result.message}`);
    } else {
      core.warning(`❌ ${result.message}`);
    }
  }

  if (!passed) {
    core.setOutput('milestone_passed', 'false');
    core.setOutput('milestone_failures', failures.join('; '));
  } else {
    core.setOutput('milestone_passed', 'true');
    core.setOutput('milestone_failures', '');
  }

  return passed;
}
