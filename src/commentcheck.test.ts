import { runCommentCheck, CommentCheckConfig } from "./commentcheck";
import { PRContext } from "./types";

const makeContext = (overrides: Record<string, unknown> = {}): PRContext =>
  ({
    title: "feat: add feature",
    body: "Some description",
    labels: [],
    unresolvedComments: 0,
    comments: [],
    ...overrides,
  } as unknown as PRContext);

describe("runCommentCheck", () => {
  it("passes when no unresolved comments and requireResolved is true", () => {
    const ctx = makeContext({ unresolvedComments: 0 });
    const config: CommentCheckConfig = { requireResolved: true };
    const result = runCommentCheck(ctx, config);
    expect(result.passed).toBe(true);
  });

  it("fails when unresolved comments exist and requireResolved is true", () => {
    const ctx = makeContext({ unresolvedComments: 2 });
    const config: CommentCheckConfig = { requireResolved: true };
    const result = runCommentCheck(ctx, config);
    expect(result.passed).toBe(false);
    expect(result.message).toContain("2 unresolved");
  });

  it("passes when unresolved count is within maxUnresolved", () => {
    const ctx = makeContext({ unresolvedComments: 1 });
    const config: CommentCheckConfig = { maxUnresolved: 3 };
    const result = runCommentCheck(ctx, config);
    expect(result.passed).toBe(true);
  });

  it("fails when unresolved count exceeds maxUnresolved", () => {
    const ctx = makeContext({ unresolvedComments: 5 });
    const config: CommentCheckConfig = { maxUnresolved: 2 };
    const result = runCommentCheck(ctx, config);
    expect(result.passed).toBe(false);
    expect(result.message).toContain("exceeding the maximum of 2");
  });

  it("fails when a bot comment contains a forbidden phrase", () => {
    const ctx = makeContext({
      unresolvedComments: 0,
      comments: [{ body: "DO NOT MERGE: breaking change", user: "bot" }],
    });
    const config: CommentCheckConfig = { forbiddenBotComments: ["DO NOT MERGE"] };
    const result = runCommentCheck(ctx, config);
    expect(result.passed).toBe(false);
    expect(result.message).toContain("DO NOT MERGE");
  });

  it("passes when no comments match forbidden phrases", () => {
    const ctx = makeContext({
      unresolvedComments: 0,
      comments: [{ body: "Ship it!", user: "bot" }],
    });
    const config: CommentCheckConfig = { forbiddenBotComments: ["DO NOT MERGE"] };
    const result = runCommentCheck(ctx, config);
    expect(result.passed).toBe(true);
  });

  it("passes with empty config", () => {
    const ctx = makeContext({ unresolvedComments: 10 });
    const config: CommentCheckConfig = {};
    const result = runCommentCheck(ctx, config);
    expect(result.passed).toBe(true);
  });
});
