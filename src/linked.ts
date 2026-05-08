import * as core from "@actions/core";

export interface LinkedIssueResult {
  pass: boolean;
  issueNumbers: number[];
  message: string;
}

const ISSUE_PATTERNS = [
  /(?:closes?|fixes?|resolves?)\s+#(\d+)/gi,
  /(?:closes?|fixes?|resolves?)\s+https?:\/\/github\.com\/[\w-]+\/[\w-]+\/issues\/(\d+)/gi,
];

export function extractLinkedIssues(body: string): number[] {
  const found = new Set<number>();
  for (const pattern of ISSUE_PATTERNS) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(body)) !== null) {
      found.add(parseInt(match[1], 10));
    }
  }
  return Array.from(found).sort((a, b) => a - b);
}

export function checkLinkedIssue(
  body: string,
  required: boolean,
  minCount: number = 1
): LinkedIssueResult {
  const issueNumbers = extractLinkedIssues(body);

  if (!required) {
    return { pass: true, issueNumbers, message: "Linked issue check skipped (not required)" };
  }

  if (issueNumbers.length < minCount) {
    return {
      pass: false,
      issueNumbers,
      message: `PR must reference at least ${minCount} issue(s) via closing keywords. Found: ${issueNumbers.length}`,
    };
  }

  return {
    pass: true,
    issueNumbers,
    message: `Linked issue(s) found: ${issueNumbers.map((n) => `#${n}`).join(", ")}`,
  };
}

export function logLinkedIssueResult(result: LinkedIssueResult): void {
  if (result.pass) {
    core.info(`[linked-issue] PASS — ${result.message}`);
  } else {
    core.warning(`[linked-issue] FAIL — ${result.message}`);
  }
}
