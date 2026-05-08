import { extractLinkedIssues, checkLinkedIssue } from "./linked";

describe("extractLinkedIssues", () => {
  it("extracts single closing keyword", () => {
    expect(extractLinkedIssues("Closes #42")).toEqual([42]);
  });

  it("extracts multiple issues", () => {
    expect(extractLinkedIssues("Fixes #10\nResolves #20")).toEqual([10, 20]);
  });

  it("handles full GitHub URL", () => {
    expect(
      extractLinkedIssues("Closes https://github.com/owner/repo/issues/99")
    ).toEqual([99]);
  });

  it("returns empty array when no issues found", () => {
    expect(extractLinkedIssues("No issue here")).toEqual([]);
  });

  it("deduplicates repeated issue numbers", () => {
    expect(extractLinkedIssues("Closes #5\nFixes #5")).toEqual([5]);
  });

  it("is case-insensitive", () => {
    expect(extractLinkedIssues("CLOSES #7")).toEqual([7]);
  });
});

describe("checkLinkedIssue", () => {
  it("passes when not required regardless of body", () => {
    const result = checkLinkedIssue("no issues here", false);
    expect(result.pass).toBe(true);
  });

  it("fails when required and no issues found", () => {
    const result = checkLinkedIssue("just a description", true);
    expect(result.pass).toBe(false);
    expect(result.issueNumbers).toEqual([]);
  });

  it("passes when required and issue found", () => {
    const result = checkLinkedIssue("Closes #1", true);
    expect(result.pass).toBe(true);
    expect(result.issueNumbers).toEqual([1]);
  });

  it("fails when minCount not satisfied", () => {
    const result = checkLinkedIssue("Closes #1", true, 2);
    expect(result.pass).toBe(false);
    expect(result.message).toContain("at least 2");
  });

  it("passes when minCount satisfied", () => {
    const result = checkLinkedIssue("Closes #1\nFixes #2", true, 2);
    expect(result.pass).toBe(true);
    expect(result.issueNumbers).toEqual([1, 2]);
  });
});
