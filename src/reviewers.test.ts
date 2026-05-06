import { checkRequiredReviewers, checkMinReviewers } from "./reviewers";
import { PRContext } from "./types";

const baseContext = (): PRContext => ({
  title: "feat: add thing",
  body: "description",
  labels: [],
  reviewers: ["alice", "bob"],
  author: "dev",
  draft: false
} as unknown as PRContext);

describe("checkRequiredReviewers", () => {
  it("passes when all required reviewers are present", () => {
    const result = checkRequiredReviewers(baseContext(), { requiredReviewers: ["alice"] });
    expect(result.passed).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it("fails when a required reviewer is missing", () => {
    const result = checkRequiredReviewers(baseContext(), { requiredReviewers: ["carol"] });
    expect(result.passed).toBe(false);
    expect(result.missing).toContain("carol");
  });

  it("passes with no required reviewers configured", () => {
    const result = checkRequiredReviewers(baseContext(), {});
    expect(result.passed).toBe(true);
  });
});

describe("checkMinReviewers", () => {
  it("passes when reviewer count meets minimum", () => {
    const result = checkMinReviewers(baseContext(), { minReviewers: 2 });
    expect(result.passed).toBe(true);
  });

  it("fails when reviewer count is below minimum", () => {
    const result = checkMinReviewers(baseContext(), { minReviewers: 3 });
    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/3/);
  });

  it("passes with zero min reviewers", () => {
    const ctx = { ...baseContext(), reviewers: [] } as unknown as PRContext;
    const result = checkMinReviewers(ctx, { minReviewers: 0 });
    expect(result.passed).toBe(true);
  });
});
