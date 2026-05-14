import { runEnforceCheck, loadEnforceConfig } from "./enforcecheck";
import { EnforceConfig } from "./enforce";
import { PRContext } from "./types";

jest.mock("@actions/core", () => ({
  getInput: jest.fn((key: string) => {
    const map: Record<string, string> = {
      require_milestone: "false",
      require_assignee: "false",
      require_linked_issue: "false",
      require_approvals: "0",
      block_draft_merge: "false",
      block_on_stale: "false",
      stale_days_threshold: "30",
    };
    return map[key] ?? "";
  }),
  info: jest.fn(),
  warning: jest.fn(),
}));

function makeContext(overrides: Partial<PRContext> = {}): PRContext {
  return {
    title: "Fix bug",
    body: "Fixes something",
    labels: [],
    draft: false,
    assignees: [],
    milestone: null,
    ...overrides,
  } as unknown as PRContext;
}

const noopConfig: EnforceConfig = {
  requireMilestone: false,
  requireAssignee: false,
  requireLinkedIssue: false,
  requireApprovals: 0,
  blockDraftMerge: false,
  blockOnStale: false,
  staleDaysThreshold: 30,
};

describe("loadEnforceConfig", () => {
  it("loads defaults from core.getInput", () => {
    const config = loadEnforceConfig();
    expect(config.requireMilestone).toBe(false);
    expect(config.blockDraftMerge).toBe(false);
    expect(config.staleDaysThreshold).toBe(30);
  });
});

describe("runEnforceCheck", () => {
  it("passes when all rules disabled", () => {
    const result = runEnforceCheck(makeContext(), noopConfig);
    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it("fails and lists failures when rules are violated", () => {
    const config: EnforceConfig = { ...noopConfig, requireMilestone: true, requireAssignee: true };
    const result = runEnforceCheck(makeContext(), config);
    expect(result.passed).toBe(false);
    expect(result.failures).toHaveLength(2);
    expect(result.failures[0]).toContain("require-milestone");
    expect(result.failures[1]).toContain("require-assignee");
  });

  it("passes when all enabled rules are satisfied", () => {
    const config: EnforceConfig = { ...noopConfig, requireAssignee: true, blockDraftMerge: true };
    const ctx = makeContext({ assignees: ["bob"], draft: false });
    const result = runEnforceCheck(ctx, config);
    expect(result.passed).toBe(true);
  });
});
