import { describe, it, expect } from "vitest";

import {
  normalizeTitleForComparison,
  computeSimilarity,
  checkDuplicatePR,
} from "./duplicate";
import { PRContext } from "./types";

function makeContext(title: string): PRContext {
  return {
    prNumber: 42,
    title,
    description: "",
    labels: [],
    author: "dev",
    isDraft: false,
    baseBranch: "main",
    headBranch: "feature/test",
    assignees: [],
    reviewers: [],
    milestone: null,
    updatedAt: new Date().toISOString(),
  };
}

describe("normalizeTitleForComparison", () => {
  it("strips conventional commit prefix", () => {
    expect(normalizeTitleForComparison("feat: add login page")).toBe("add login page");
    expect(normalizeTitleForComparison("Fix: Remove bug")).toBe("remove bug");
  });

  it("removes punctuation and lowercases", () => {
    expect(normalizeTitleForComparison("Add OAuth2.0 support!")).toBe("add oauth20 support");
  });

  it("collapses whitespace", () => {
    expect(normalizeTitleForComparison("  add   login  ")).toBe("add login");
  });
});

describe("computeSimilarity", () => {
  it("returns 1.0 for identical titles", () => {
    expect(computeSimilarity("add login page", "add login page")).toBe(1.0);
  });

  it("returns 0 for completely different titles", () => {
    expect(computeSimilarity("add login", "remove footer")).toBe(0);
  });

  it("returns partial similarity for overlapping words", () => {
    const sim = computeSimilarity("add login page", "add signup page");
    expect(sim).toBeGreaterThan(0);
    expect(sim).toBeLessThan(1);
  });
});

describe("checkDuplicatePR", () => {
  const openPRs = [
    { number: 10, title: "feat: add login page" },
    { number: 11, title: "chore: update dependencies" },
  ];

  it("flags a near-duplicate title", () => {
    const ctx = makeContext("feat: add login page");
    const result = checkDuplicatePR(ctx, openPRs, 0.8);
    expect(result.isDuplicate).toBe(true);
    expect(result.matchedPR).toBe(10);
    expect(result.passed).toBe(false);
  });

  it("passes a unique title", () => {
    const ctx = makeContext("feat: implement dark mode");
    const result = checkDuplicatePR(ctx, openPRs, 0.8);
    expect(result.isDuplicate).toBe(false);
    expect(result.passed).toBe(true);
  });

  it("ignores the PR itself", () => {
    const ctx = makeContext("feat: add login page");
    const result = checkDuplicatePR(ctx, [{ number: 42, title: "feat: add login page" }], 0.8);
    expect(result.isDuplicate).toBe(false);
  });

  it("respects a lower threshold", () => {
    const ctx = makeContext("feat: add login screen");
    const result = checkDuplicatePR(ctx, openPRs, 0.3);
    expect(result.isDuplicate).toBe(true);
  });
});
