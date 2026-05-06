import * as github from '@actions/github';
import { MilestoneConfig, MilestoneResult } from './types';

/**
 * Check if the PR has a milestone assigned when required.
 */
export function checkMilestoneRequired(
  milestone: { title: string; number: number } | null | undefined,
  config: MilestoneConfig
): MilestoneResult {
  if (!config.required) {
    return { passed: true, message: 'Milestone check skipped (not required)' };
  }

  if (!milestone) {
    return { passed: false, message: 'PR must have a milestone assigned before merge' };
  }

  return { passed: true, message: `Milestone assigned: "${milestone.title}"` };
}

/**
 * Check if the assigned milestone matches an allowed pattern.
 */
export function checkMilestonePattern(
  milestone: { title: string; number: number } | null | undefined,
  pattern: string | undefined
): MilestoneResult {
  if (!pattern || !milestone) {
    return { passed: true, message: 'Milestone pattern check skipped' };
  }

  const regex = new RegExp(pattern);
  if (!regex.test(milestone.title)) {
    return {
      passed: false,
      message: `Milestone "${milestone.title}" does not match required pattern: ${pattern}`,
    };
  }

  return { passed: true, message: `Milestone "${milestone.title}" matches pattern` };
}

/**
 * Run all milestone checks and return combined results.
 */
export function runMilestoneChecks(
  milestone: { title: string; number: number } | null | undefined,
  config: MilestoneConfig
): MilestoneResult[] {
  const results: MilestoneResult[] = [];

  results.push(checkMilestoneRequired(milestone, config));
  results.push(checkMilestonePattern(milestone, config.pattern));

  return results;
}
