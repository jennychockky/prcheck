import { evaluateEnforceRule, runEnforceChecks, EnforceConfig } from "./enforce";
import { PRContext } from "./types";

const baseConfig: EnforceConfig = {
  requireMilestone: false,
  requireAssignee: false,
  requireLinkedIssue: false,
  requireApprovals: 0,
  blockDraftMerge: false,
  blockOnStale: false,
  staleDaysThreshold: 30,
};

function makeContext(overrides: Partial<PRContext> = {}): PRContext {
  return {
    title: "Test PR",
    body: "Some body",
    labels: [],
    draft: false,
    assignees: [],
    milestone: null,
    ...overrides,
  } as unknown as PRContext;
}

describe("evaluateEnforceRule", () => {
  it("returns passed result", () => {
    const result = evaluateEnforceRule("test-rule", true, "All good");
    expect(result).toEqual({ rule: "test-rule", passed: true, message: "All good" });
  });

  it("returns failed result", () => {
    const result = evaluateEnforceRule("test-rule", false, "Missing");
    expect(result.passed).toBe(false);
  });
});

describe("runEnforceChecks", () => {
  it("returns empty results when no rules enabled", () => {
    const results = runEnforceChecks(makeContext(), baseConfig);
    expect(results).toHaveLength(0);
  });

  it("fails require-milestone when no milestone set", () => {
    const cfg = { ...baseConfig, requireMilestone: true };
    const results = runEnforceChecks(makeContext({ milestone: null }), cfg);
    expect(results[0].rule).toBe("require-milestone");
    expect(results[0].passed).toBe(false);
  });

  it("passes require-milestone when milestone is set", () => {
    const cfg = { ...baseConfig, requireMilestone: true };
    const results = runEnforceChecks(makeContext({ milestone: "v1.0" } as any), cfg);
    expect(results[0].passed).toBe(true);
  });

  it("fails require-assignee when no assignees", () => {
    const cfg = { ...baseConfig, requireAssignee: true };
    const results = runEnforceChecks(makeContext({ assignees: [] }), cfg);
    expect(results[0].rule).toBe("require-assignee");
    expect(results[0].passed).toBe(false);
  });

  it("passes require-assignee with assignees present", () => {
    const cfg = { ...baseConfig, requireAssignee: true };
    const results = runEnforceChecks(makeContext({ assignees: ["alice"] }), cfg);
    expect(results[0].passed).toBe(true);
  });

  it("fails block-draft when PR is draft", () => {
    const cfg = { ...baseConfig, blockDraftMerge: true };
    const results = runEnforceChecks(makeContext({ draft: true }), cfg);
    expect(results[0].rule).toBe("block-draft");
    expect(results[0].passed).toBe(false);
  });

  it("passes block-draft when PR is not draft", () => {
    const cfg = { ...baseConfig, blockDraftMerge: true };
    const results = runEnforceChecks(makeContext({ draft: false }), cfg);
    expect(results[0].passed).toBe(true);
  });
});
