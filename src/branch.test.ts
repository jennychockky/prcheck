import { checkBranchName, getBaseBranch, getHeadBranch } from "./branch";

jest.mock("@actions/core", () => ({ warning: jest.fn() }));

describe("checkBranchName", () => {
  it("passes when no pattern is configured", () => {
    const result = checkBranchName("any-branch", "");
    expect(result.passed).toBe(true);
  });

  it("passes when branch matches pattern", () => {
    const result = checkBranchName("feat/my-feature", "^feat/.+");
    expect(result.passed).toBe(true);
    expect(result.message).toContain("matches");
  });

  it("fails when branch does not match pattern", () => {
    const result = checkBranchName("random-branch", "^feat/.+");
    expect(result.passed).toBe(false);
    expect(result.message).toContain("does not match");
  });

  it("skips check gracefully on invalid regex", () => {
    const result = checkBranchName("feat/x", "[invalid(");
    expect(result.passed).toBe(true);
    expect(result.message).toContain("Invalid pattern");
  });

  it("matches branch with complex pattern", () => {
    const result = checkBranchName("fix/JIRA-123-fix-bug", "^(feat|fix|chore)/.+");
    expect(result.passed).toBe(true);
  });
});

describe("getBaseBranch", () => {
  it("returns base ref from payload", () => {
    const payload = { pull_request: { base: { ref: "main" }, head: { ref: "feat/x" } } };
    expect(getBaseBranch(payload)).toBe("main");
  });

  it("returns empty string when payload is missing", () => {
    expect(getBaseBranch({})).toBe("");
  });
});

describe("getHeadBranch", () => {
  it("returns head ref from payload", () => {
    const payload = { pull_request: { base: { ref: "main" }, head: { ref: "feat/my-feature" } } };
    expect(getHeadBranch(payload)).toBe("feat/my-feature");
  });

  it("returns empty string when payload is missing", () => {
    expect(getHeadBranch({})).toBe("");
  });
});
