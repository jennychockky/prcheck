import { checkMergeability, logMergeableResult, MergeableConfig } from "./mergeable";
import * as core from "@actions/core";
import { PRContext } from "./types";

jest.mock("@actions/core");

function makeContext(overrides: Partial<PRContext> = {}): PRContext {
  return {
    title: "Test PR",
    body: "Some description",
    labels: [],
    isDraft: false,
    mergeable: true,
    mergeableState: "clean",
    ...overrides,
  } as PRContext;
}

const defaultConfig: MergeableConfig = {
  requireMergeable: true,
  blockOnConflicts: true,
  allowDraft: false,
};

describe("checkMergeability", () => {
  it("passes for a clean, non-draft PR", () => {
    const result = checkMergeability(makeContext(), defaultConfig);
    expect(result.passed).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  it("fails when PR is a draft and allowDraft is false", () => {
    const result = checkMergeability(
      makeContext({ isDraft: true }),
      defaultConfig
    );
    expect(result.passed).toBe(false);
    expect(result.reasons).toContain("PR is still in draft state");
  });

  it("passes when PR is draft and allowDraft is true", () => {
    const result = checkMergeability(
      makeContext({ isDraft: true }),
      { ...defaultConfig, allowDraft: true }
    );
    expect(result.passed).toBe(true);
  });

  it("fails when mergeable is false and requireMergeable is true", () => {
    const result = checkMergeability(
      makeContext({ mergeable: false }),
      defaultConfig
    );
    expect(result.passed).toBe(false);
    expect(result.reasons).toContain("PR has merge conflicts that must be resolved");
  });

  it("fails when mergeableState is dirty and blockOnConflicts is true", () => {
    const result = checkMergeability(
      makeContext({ mergeableState: "dirty" }),
      defaultConfig
    );
    expect(result.passed).toBe(false);
    expect(result.reasons).toContain("PR branch is out of date or has conflicts");
  });

  it("fails when mergeableState is blocked", () => {
    const result = checkMergeability(
      makeContext({ mergeableState: "blocked" }),
      defaultConfig
    );
    expect(result.passed).toBe(false);
    expect(result.reasons).toContain("PR is blocked by branch protection rules");
  });

  it("returns mergeable null when context has no value", () => {
    const result = checkMergeability(
      makeContext({ mergeable: undefined }),
      { ...defaultConfig, requireMergeable: false }
    );
    expect(result.mergeable).toBeNull();
  });
});

describe("logMergeableResult", () => {
  it("logs info when passed", () => {
    logMergeableResult({ passed: true, mergeable: true, mergeableState: "clean", isDraft: false, reasons: [] });
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("mergeable"));
  });

  it("logs warnings when not passed", () => {
    logMergeableResult({ passed: false, mergeable: false, mergeableState: "dirty", isDraft: false, reasons: ["has conflicts"] });
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining("has conflicts"));
  });
});
