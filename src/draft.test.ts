import { checkDraftStatus, logDraftResult } from "./draft";
import { PRContext } from "./types";
import * as core from "@actions/core";

jest.mock("@actions/core");

function makeContext(overrides: Partial<PRContext> = {}): PRContext {
  return {
    number: 1,
    title: "Test PR",
    body: "Some description",
    labels: [],
    draft: false,
    author: "user",
    assignees: [],
    reviewers: [],
    baseBranch: "main",
    headBranch: "feature/test",
    ...overrides,
  } as PRContext;
}

describe("checkDraftStatus", () => {
  it("returns not blocked when PR is not draft", () => {
    const result = checkDraftStatus(makeContext({ draft: false }), true);
    expect(result.isDraft).toBe(false);
    expect(result.blocked).toBe(false);
  });

  it("blocks draft PR when blockDraft is true", () => {
    const result = checkDraftStatus(makeContext({ draft: true }), true);
    expect(result.isDraft).toBe(true);
    expect(result.blocked).toBe(true);
    expect(result.message).toMatch(/draft state/);
  });

  it("does not block draft PR when blockDraft is false", () => {
    const result = checkDraftStatus(makeContext({ draft: true }), false);
    expect(result.isDraft).toBe(true);
    expect(result.blocked).toBe(false);
    expect(result.message).toMatch(/allowed/);
  });

  it("returns ready message when not draft", () => {
    const result = checkDraftStatus(makeContext({ draft: false }), true);
    expect(result.message).toMatch(/ready/);
  });
});

describe("logDraftResult", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls core.warning when blocked", () => {
    logDraftResult({ isDraft: true, blocked: true, message: "blocked" });
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining("blocked"));
  });

  it("calls core.info when draft but not blocked", () => {
    logDraftResult({ isDraft: true, blocked: false, message: "allowed" });
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("allowed"));
  });

  it("calls core.info when not draft", () => {
    logDraftResult({ isDraft: false, blocked: false, message: "ready" });
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("ready"));
  });
});
