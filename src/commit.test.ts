import { describe, it, expect } from "vitest";
import {
  parseCommitMessage,
  checkConventionalCommit,
  checkCommitMessages,
  CommitInfo,
} from "./commit";

const makeCommit = (overrides: Partial<CommitInfo> = {}): CommitInfo => ({
  sha: "abc1234567890",
  message: "feat: add new feature",
  author: "dev",
  verified: true,
  ...overrides,
});

describe("parseCommitMessage", () => {
  it("splits subject and body", () => {
    const { subject, body } = parseCommitMessage("feat: hello\n\nsome body text");
    expect(subject).toBe("feat: hello");
    expect(body).toBe("some body text");
  });

  it("returns empty body when no blank line", () => {
    const { subject, body } = parseCommitMessage("fix: something");
    expect(subject).toBe("fix: something");
    expect(body).toBe("");
  });
});

describe("checkConventionalCommit", () => {
  it("passes valid conventional commits", () => {
    expect(checkConventionalCommit("feat: add login")).toBe(true);
    expect(checkConventionalCommit("fix(auth): resolve token issue")).toBe(true);
    expect(checkConventionalCommit("chore!: breaking change")).toBe(true);
  });

  it("fails non-conventional commits", () => {
    expect(checkConventionalCommit("added stuff")).toBe(false);
    expect(checkConventionalCommit("WIP: testing")).toBe(false);
  });

  it("accepts custom pattern", () => {
    const pattern = /^JIRA-\d+: .+/;
    expect(checkConventionalCommit("JIRA-123: fix bug", pattern)).toBe(true);
    expect(checkConventionalCommit("feat: fix bug", pattern)).toBe(false);
  });
});

describe("checkCommitMessages", () => {
  it("passes with no violations", () => {
    const result = checkCommitMessages([makeCommit()]);
    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("flags long subjects", () => {
    const commit = makeCommit({ message: "feat: " + "a".repeat(80) });
    const result = checkCommitMessages([commit], { maxSubjectLength: 72 });
    expect(result.passed).toBe(false);
    expect(result.violations[0]).toContain("exceeds 72 characters");
  });

  it("flags non-conventional when required", () => {
    const commit = makeCommit({ message: "updated readme" });
    const result = checkCommitMessages([commit], { requireConventional: true });
    expect(result.passed).toBe(false);
    expect(result.violations[0]).toContain("conventional commit");
  });

  it("flags unverified commits when requireSigned", () => {
    const commit = makeCommit({ verified: false });
    const result = checkCommitMessages([commit], { requireSigned: true });
    expect(result.passed).toBe(false);
    expect(result.violations[0]).toContain("signature verification");
  });

  it("reports total commit count", () => {
    const commits = [makeCommit(), makeCommit({ sha: "def456" })];
    const result = checkCommitMessages(commits);
    expect(result.totalCommits).toBe(2);
  });
});
