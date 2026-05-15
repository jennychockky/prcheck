import {
  countUnresolvedComments,
  filterBotComments,
  checkCommentThreshold,
  hasForbiddenPhraseInComments,
  PRComment,
} from "./comment";

const makeComment = (overrides: Partial<PRComment> = {}): PRComment => ({
  id: 1,
  body: "LGTM",
  user: "alice",
  isBot: false,
  resolved: true,
  ...overrides,
});

describe("countUnresolvedComments", () => {
  it("returns 0 when all resolved", () => {
    const comments = [makeComment({ resolved: true }), makeComment({ resolved: true })];
    expect(countUnresolvedComments(comments)).toBe(0);
  });

  it("counts unresolved comments", () => {
    const comments = [
      makeComment({ resolved: false }),
      makeComment({ resolved: true }),
      makeComment({ resolved: false }),
    ];
    expect(countUnresolvedComments(comments)).toBe(2);
  });
});

describe("filterBotComments", () => {
  it("returns only bot comments", () => {
    const comments = [
      makeComment({ isBot: false, user: "alice" }),
      makeComment({ isBot: true, user: "dependabot" }),
    ];
    expect(filterBotComments(comments)).toHaveLength(1);
    expect(filterBotComments(comments)[0].user).toBe("dependabot");
  });

  it("returns empty if no bots", () => {
    const comments = [makeComment({ isBot: false })];
    expect(filterBotComments(comments)).toHaveLength(0);
  });
});

describe("checkCommentThreshold", () => {
  it("passes when under threshold", () => {
    expect(checkCommentThreshold(2, 5)).toBe(true);
  });

  it("passes when equal to threshold", () => {
    expect(checkCommentThreshold(3, 3)).toBe(true);
  });

  it("fails when over threshold", () => {
    expect(checkCommentThreshold(6, 3)).toBe(false);
  });
});

describe("hasForbiddenPhraseInComments", () => {
  it("detects forbidden phrase", () => {
    const comments = [makeComment({ body: "WIP: not ready" })];
    const result = hasForbiddenPhraseInComments(comments, ["WIP"]);
    expect(result.found).toBe(true);
    expect(result.phrase).toBe("WIP");
  });

  it("returns not found when no match", () => {
    const comments = [makeComment({ body: "Looks good!" })];
    const result = hasForbiddenPhraseInComments(comments, ["DO NOT MERGE"]);
    expect(result.found).toBe(false);
  });

  it("returns not found for empty phrases list", () => {
    const comments = [makeComment({ body: "anything" })];
    const result = hasForbiddenPhraseInComments(comments, []);
    expect(result.found).toBe(false);
  });
});
