import { checkAutoClose, AutoCloseConfig, AutoCloseResult } from "./autoclose";
import { PRContext } from "./types";

const NOW = new Date("2024-06-01T00:00:00Z");

function daysAgo(days: number): string {
  const d = new Date(NOW);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function makeContext(overrides: Partial<PRContext> = {}): PRContext {
  return {
    title: "Test PR",
    body: "",
    labels: [],
    draft: false,
    updatedAt: daysAgo(0),
    createdAt: daysAgo(0),
    ...overrides,
  } as PRContext;
}

const baseConfig: AutoCloseConfig = {
  enabled: true,
  staleDays: 30,
};

describe("checkAutoClose", () => {
  it("returns shouldClose=false when disabled", () => {
    const ctx = makeContext({ updatedAt: daysAgo(90) });
    const result = checkAutoClose(ctx, { ...baseConfig, enabled: false }, NOW);
    expect(result.shouldClose).toBe(false);
  });

  it("returns shouldClose=false when within stale threshold", () => {
    const ctx = makeContext({ updatedAt: daysAgo(10) });
    const result = checkAutoClose(ctx, baseConfig, NOW);
    expect(result.shouldClose).toBe(false);
    expect(result.daysSinceUpdate).toBe(10);
  });

  it("returns shouldClose=true when beyond stale threshold", () => {
    const ctx = makeContext({ updatedAt: daysAgo(31) });
    const result = checkAutoClose(ctx, baseConfig, NOW);
    expect(result.shouldClose).toBe(true);
    expect(result.reason).toContain("31 days");
  });

  it("closes draft PR early when draftDays is set", () => {
    const ctx = makeContext({ draft: true, updatedAt: daysAgo(15) });
    const config: AutoCloseConfig = { ...baseConfig, staleDays: 30, draftDays: 10 };
    const result = checkAutoClose(ctx, config, NOW);
    expect(result.shouldClose).toBe(true);
    expect(result.isDraft).toBe(true);
    expect(result.reason).toContain("Draft PR");
  });

  it("does not close draft PR within draftDays", () => {
    const ctx = makeContext({ draft: true, updatedAt: daysAgo(5) });
    const config: AutoCloseConfig = { ...baseConfig, draftDays: 10 };
    const result = checkAutoClose(ctx, config, NOW);
    expect(result.shouldClose).toBe(false);
  });

  it("falls back to createdAt when updatedAt is missing", () => {
    const ctx = { ...makeContext(), updatedAt: undefined, createdAt: daysAgo(40) } as unknown as PRContext;
    const result = checkAutoClose(ctx, baseConfig, NOW);
    expect(result.shouldClose).toBe(true);
    expect(result.daysSinceUpdate).toBe(40);
  });
});
