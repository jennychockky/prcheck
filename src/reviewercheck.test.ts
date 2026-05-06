import { runReviewerChecks } from "./reviewercheck";
import { PRContext } from "./types";

const makeContext = (reviewers: string[]): PRContext =>
  ({
    title: "fix: something",
    body: "body text",
    labels: [],
    reviewers,
    author: "dev",
    draft: false
  } as unknown as PRContext);

describe("runReviewerChecks", () => {
  it("returns passed=true when no checks configured", () => {
    const result = runReviewerChecks(makeContext([]), {});
    expect(result.passed).toBe(true);
    expect(result.results).toHaveLength(0);
  });

  it("passes all checks when reviewers satisfy config", () => {
    const result = runReviewerChecks(makeContext(["alice", "bob"]), {
      requiredReviewers: ["alice"],
      minReviewers: 2
    });
    expect(result.passed).toBe(true);
    expect(result.results).toHaveLength(2);
  });

  it("fails when required reviewer is absent", () => {
    const result = runReviewerChecks(makeContext(["bob"]), {
      requiredReviewers: ["alice"]
    });
    expect(result.passed).toBe(false);
    expect(result.results[0].missing).toContain("alice");
  });

  it("fails when min reviewers not met", () => {
    const result = runReviewerChecks(makeContext(["alice"]), {
      minReviewers: 2
    });
    expect(result.passed).toBe(false);
  });

  it("aggregates multiple failures", () => {
    const result = runReviewerChecks(makeContext([]), {
      requiredReviewers: ["alice"],
      minReviewers: 1
    });
    expect(result.passed).toBe(false);
    expect(result.results).toHaveLength(2);
  });
});
