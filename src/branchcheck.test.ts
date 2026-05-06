import { runBranchChecks } from "./branchcheck";

const coreMock = { error: jest.fn(), info: jest.fn(), warning: jest.fn() };
jest.mock("@actions/core", () => coreMock);

const makePayload = (head: string, base: string) => ({
  pull_request: { head: { ref: head }, base: { ref: base } },
});

describe("runBranchChecks", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns empty array when no patterns configured", () => {
    const results = runBranchChecks(makePayload("feat/x", "main"), {});
    expect(results).toHaveLength(0);
  });

  it("passes head branch check when pattern matches", () => {
    const results = runBranchChecks(makePayload("feat/my-thing", "main"), {
      headPattern: "^feat/.+",
    });
    expect(results).toHaveLength(1);
    expect(results[0].passed).toBe(true);
    expect(results[0].name).toBe("branch-head");
    expect(coreMock.info).toHaveBeenCalled();
  });

  it("fails head branch check when pattern does not match", () => {
    const results = runBranchChecks(makePayload("random", "main"), {
      headPattern: "^feat/.+",
    });
    expect(results[0].passed).toBe(false);
    expect(coreMock.error).toHaveBeenCalled();
  });

  it("passes base branch check when pattern matches", () => {
    const results = runBranchChecks(makePayload("feat/x", "main"), {
      basePattern: "^(main|develop)$",
    });
    expect(results[0].passed).toBe(true);
    expect(results[0].name).toBe("branch-base");
  });

  it("fails base branch check when pattern does not match", () => {
    const results = runBranchChecks(makePayload("feat/x", "staging"), {
      basePattern: "^main$",
    });
    expect(results[0].passed).toBe(false);
  });

  it("runs both head and base checks when both patterns provided", () => {
    const results = runBranchChecks(makePayload("feat/x", "main"), {
      headPattern: "^feat/.+",
      basePattern: "^main$",
    });
    expect(results).toHaveLength(2);
    expect(results.every((r) => r.passed)).toBe(true);
  });
});
