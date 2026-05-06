import * as github from "@actions/github";

export interface CommitInfo {
  sha: string;
  message: string;
  author: string;
  verified: boolean;
}

export interface CommitCheckResult {
  passed: boolean;
  totalCommits: number;
  violations: string[];
  commits: CommitInfo[];
}

export function parseCommitMessage(message: string): { subject: string; body: string } {
  const lines = message.split("\n");
  const subject = lines[0]?.trim() ?? "";
  const body = lines.slice(2).join("\n").trim();
  return { subject, body };
}

export function checkConventionalCommit(message: string, pattern?: RegExp): boolean {
  const defaultPattern = /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\(.+\))?!?: .+/;
  const re = pattern ?? defaultPattern;
  const { subject } = parseCommitMessage(message);
  return re.test(subject);
}

export function checkCommitMessages(
  commits: CommitInfo[],
  options: { requireConventional?: boolean; maxSubjectLength?: number; requireSigned?: boolean } = {}
): CommitCheckResult {
  const { requireConventional = false, maxSubjectLength = 72, requireSigned = false } = options;
  const violations: string[] = [];

  for (const commit of commits) {
    const { subject } = parseCommitMessage(commit.message);

    if (subject.length > maxSubjectLength) {
      violations.push(`Commit ${commit.sha.slice(0, 7)}: subject exceeds ${maxSubjectLength} characters (${subject.length})`);
    }

    if (requireConventional && !checkConventionalCommit(commit.message)) {
      violations.push(`Commit ${commit.sha.slice(0, 7)}: does not follow conventional commit format`);
    }

    if (requireSigned && !commit.verified) {
      violations.push(`Commit ${commit.sha.slice(0, 7)}: signature verification failed`);
    }
  }

  return {
    passed: violations.length === 0,
    totalCommits: commits.length,
    violations,
    commits,
  };
}
