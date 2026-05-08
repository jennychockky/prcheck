import * as core from "@actions/core";
import { checkLinkedIssue, logLinkedIssueResult, LinkedIssueResult } from "./linked";

export interface LinkedCheckConfig {
  required: boolean;
  minCount?: number;
}

export interface LinkedCheckOutput {
  result: LinkedIssueResult;
  passed: boolean;
}

export function runLinkedIssueCheck(
  body: string,
  config: LinkedCheckConfig
): LinkedCheckOutput {
  const { required, minCount = 1 } = config;

  const result = checkLinkedIssue(body, required, minCount);
  logLinkedIssueResult(result);

  if (!result.pass) {
    core.setFailed(result.message);
  }

  core.setOutput("linked_issues", result.issueNumbers.join(","));
  core.setOutput("linked_issue_count", String(result.issueNumbers.length));
  core.setOutput("linked_issue_check_passed", String(result.pass));

  return { result, passed: result.pass };
}
