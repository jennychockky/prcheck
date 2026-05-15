import { extractScopeFromTitle, runScopeCheck, ScopeConfig } from "./scopecheck";
import { PRContext } from "./types";

function makeContext(overrides: Partial<PRContext> = {}): PRContext {
  return {
    title: "feat(auth): add login flow",
    body: "",
    labels: [],
    author: "dev",
    isDraft: false,
    ...overrides,
  } as PRContext;
}

const baseConfig: ScopeConfig = {
  allowedScopes: ["auth", "api", "ui"],
  requireScope: false,
};

describe("extractScopeFromTitle", () => {
  it("extracts scope from conventional commit title", () => {
    expect(extractScopeFromTitle("feat(auth): add login")).toBe("auth");
  });

  it("returns null when no scope is present", () => {
    expect(extractScopeFromTitle("feat: add login")).toBeNull();
  });

  it("returns null for non-conventional titles", () => {
    expect(extractScopeFromTitle("Add login flow")).toBeNull();
  });
});

describe("runScopeCheck", () => {
  it("passes when scope is in allowed list", () => {
    const result = runScopeCheck(makeContext(), baseConfig);
    expect(result.passed).toBe(true);
    expect(result.scope).toBe("auth");
  });

  it("fails when scope is not in allowed list", () => {
    const ctx = makeContext({ title: "feat(payments): add checkout" });
    const result = runScopeCheck(ctx, baseConfig);
    expect(result.passed).toBe(false);
    expect(result.message).toContain("payments");
  });

  it("passes when no scope and requireScope is false", () => {
    const ctx = makeContext({ title: "chore: update deps" });
    const result = runScopeCheck(ctx, baseConfig);
    expect(result.passed).toBe(true);
  });

  it("fails when scope is required but missing", () => {
    const ctx = makeContext({ title: "chore: update deps" });
    const result = runScopeCheck(ctx, { ...baseConfig, requireScope: true });
    expect(result.passed).toBe(false);
    expect(result.message).toContain("missing a required scope");
  });

  it("fails when expected scope label is absent", () => {
    const ctx = makeContext({ labels: [] });
    const result = runScopeCheck(ctx, { ...baseConfig, labelPrefix: "scope:" });
    expect(result.passed).toBe(false);
    expect(result.message).toContain("scope:auth");
  });

  it("passes when expected scope label is present", () => {
    const ctx = makeContext({ labels: ["scope:auth"] });
    const result = runScopeCheck(ctx, { ...baseConfig, labelPrefix: "scope:" });
    expect(result.passed).toBe(true);
  });
});
