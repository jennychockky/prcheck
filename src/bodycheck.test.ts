import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  checkBodyLength,
  checkForbiddenPhrases,
  checkChecklist,
  runBodyCheck,
} from "./bodycheck";
import { PRContext } from "./types";

vi.mock("@actions/core", () => ({
  info: vi.fn(),
  warning: vi.fn(),
}));

function makeContext(body: string): PRContext {
  return {
    title: "Test PR",
    body,
    labels: [],
    number: 1,
    draft: false,
    author: "user",
    baseBranch: "main",
    headBranch: "feature/test",
  } as PRContext;
}

describe("checkBodyLength", () => {
  it("passes when no constraints set", () => {
    const { minOk, maxOk } = checkBodyLength("hi");
    expect(minOk).toBe(true);
    expect(maxOk).toBe(true);
  });

  it("fails when body is too short", () => {
    const { minOk } = checkBodyLength("hi", 50);
    expect(minOk).toBe(false);
  });

  it("fails when body is too long", () => {
    const { maxOk } = checkBodyLength("a".repeat(200), undefined, 100);
    expect(maxOk).toBe(false);
  });

  it("passes when within range", () => {
    const { minOk, maxOk } = checkBodyLength("hello world", 5, 100);
    expect(minOk).toBe(true);
    expect(maxOk).toBe(true);
  });
});

describe("checkForbiddenPhrases", () => {
  it("returns empty when no phrases match", () => {
    expect(checkForbiddenPhrases("clean body", ["wip", "todo"])).toEqual([]);
  });

  it("detects forbidden phrases case-insensitively", () => {
    expect(checkForbiddenPhrases("This is a WIP PR", ["wip"])).toEqual(["wip"]);
  });

  it("returns all matching phrases", () => {
    const found = checkForbiddenPhrases("TODO: fix this HACK", ["todo", "hack"]);
    expect(found).toHaveLength(2);
  });
});

describe("checkChecklist", () => {
  it("returns true when checklist item exists", () => {
    expect(checkChecklist("- [x] Done\n- [ ] Pending")).toBe(true);
  });

  it("returns false when no checklist", () => {
    expect(checkChecklist("Just a plain description")).toBe(false);
  });
});

describe("runBodyCheck", () => {
  it("passes a well-formed body", () => {
    const ctx = makeContext("This PR fixes the login bug.\n- [x] Tests added");
    const result = runBodyCheck(ctx, { minLength: 10, requireChecklist: true });
    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("fails when body is too short", () => {
    const ctx = makeContext("short");
    const result = runBodyCheck(ctx, { minLength: 20 });
    expect(result.passed).toBe(false);
    expect(result.minLengthOk).toBe(false);
  });

  it("fails when forbidden phrase found", () => {
    const ctx = makeContext("This is a WIP change");
    const result = runBodyCheck(ctx, { forbiddenPhrases: ["wip"] });
    expect(result.forbiddenPhrasesOk).toBe(false);
    expect(result.violations.some((v) => v.includes("wip"))).toBe(true);
  });

  it("fails when checklist required but missing", () => {
    const ctx = makeContext("Some description without checklist");
    const result = runBodyCheck(ctx, { requireChecklist: true });
    expect(result.checklistOk).toBe(false);
  });

  it("handles null body gracefully", () => {
    const ctx = makeContext("");
    const result = runBodyCheck(ctx, { minLength: 5 });
    expect(result.passed).toBe(false);
    expect(result.bodyLength).toBe(0);
  });
});
