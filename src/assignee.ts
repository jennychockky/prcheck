import * as core from "@actions/core";
import { getOctokit } from "@actions/github";

export interface AssigneeCheckResult {
  hasAssignee: boolean;
  assignees: string[];
  required: boolean;
  passed: boolean;
  message: string;
}

export interface AssigneeConfig {
  required: boolean;
  minCount: number;
  allowedAssignees?: string[];
}

export function checkAssignees(
  assignees: string[],
  config: AssigneeConfig
): AssigneeCheckResult {
  const { required, minCount, allowedAssignees } = config;

  if (!required) {
    return {
      hasAssignee: assignees.length > 0,
      assignees,
      required: false,
      passed: true,
      message: "Assignee check skipped (not required)",
    };
  }

  if (assignees.length < minCount) {
    return {
      hasAssignee: assignees.length > 0,
      assignees,
      required: true,
      passed: false,
      message: `PR must have at least ${minCount} assignee(s), found ${assignees.length}`,
    };
  }

  if (allowedAssignees && allowedAssignees.length > 0) {
    const invalid = assignees.filter((a) => !allowedAssignees.includes(a));
    if (invalid.length > 0) {
      return {
        hasAssignee: true,
        assignees,
        required: true,
        passed: false,
        message: `Assignee(s) not in allowed list: ${invalid.join(", ")}`,
      };
    }
  }

  return {
    hasAssignee: true,
    assignees,
    required: true,
    passed: true,
    message: `Assignee check passed (${assignees.join(", ")})`,
  };
}

export function logAssigneeResult(result: AssigneeCheckResult): void {
  if (result.passed) {
    core.info(`✅ ${result.message}`);
  } else {
    core.warning(`❌ ${result.message}`);
  }
}
