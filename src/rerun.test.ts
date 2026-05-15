import { checkRerunEligibility, RerunConfig, RerunContext } from "./rerun";

const baseConfig: RerunConfig = {
  enabled: true,
  maxAttempts: 3,
  triggerOnLabels: ["rerun", "retry"],
};

const baseContext: RerunContext = {
  labels: ["rerun"],
  runAttempt: 1,
  runId: "abc123",
};

describe("checkRerunEligibility", () => {
  it("returns shouldRerun true when label matches and under max attempts", () => {
    const result = checkRerunEligibility(baseConfig, baseContext);
    expect(result.shouldRerun).toBe(true);
    expect(result.reason).toContain("rerun");
  });

  it("returns shouldRerun false when disabled", () => {
    const result = checkRerunEligibility({ ...baseConfig, enabled: false }, baseContext);
    expect(result.shouldRerun).toBe(false);
    expect(result.reason).toBe("rerun disabled");
  });

  it("returns shouldRerun false when max attempts reached", () => {
    const result = checkRerunEligibility(baseConfig, { ...baseContext, runAttempt: 3 });
    expect(result.shouldRerun).toBe(false);
    expect(result.reason).toContain("max attempts");
  });

  it("returns shouldRerun false when no matching label", () => {
    const result = checkRerunEligibility(baseConfig, { ...baseContext, labels: ["bug", "enhancement"] });
    expect(result.shouldRerun).toBe(false);
    expect(result.reason).toContain("no matching trigger label");
  });

  it("matches any trigger label in the list", () => {
    const result = checkRerunEligibility(baseConfig, { ...baseContext, labels: ["retry"] });
    expect(result.shouldRerun).toBe(true);
    expect(result.reason).toContain("retry");
  });

  it("returns correct attempt and maxAttempts in result", () => {
    const result = checkRerunEligibility(baseConfig, { ...baseContext, runAttempt: 2 });
    expect(result.attempt).toBe(2);
    expect(result.maxAttempts).toBe(3);
  });

  it("allows rerun on attempt 2 of 3", () => {
    const result = checkRerunEligibility(baseConfig, { ...baseContext, runAttempt: 2 });
    expect(result.shouldRerun).toBe(true);
  });
});
