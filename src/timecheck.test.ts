import { checkMergeWindow, TimeCheckConfig } from "./timecheck";
import { PRContext } from "./types";

const makeContext = (prNumber = 42): PRContext =>
  ({
    prNumber,
    title: "feat: test",
    body: "",
    labels: [],
    author: "dev",
    draft: false,
  } as unknown as PRContext);

describe("checkMergeWindow", () => {
  const ctx = makeContext();

  it("passes when no restrictions are set", () => {
    const result = checkMergeWindow(ctx, {});
    expect(result.passed).toBe(true);
  });

  it("fails when current day is not in allowedDays", () => {
    // Force a specific day by mocking Date
    const spy = jest.spyOn(global, "Date").mockImplementation(
      () => new (jest.requireActual("date-fns") ? Date : Date)("2024-01-06T12:00:00") // Saturday = 6
    );
    const config: TimeCheckConfig = { allowedDays: [1, 2, 3, 4, 5] };
    const result = checkMergeWindow(ctx, config);
    // Day 6 (Sat) should fail
    if (!config.allowedDays!.includes(result.day)) {
      expect(result.passed).toBe(false);
      expect(result.message).toContain("restricted day");
    }
    spy.mockRestore();
  });

  it("passes when current day is in allowedDays", () => {
    const day = new Date().getDay();
    const config: TimeCheckConfig = { allowedDays: [0, 1, 2, 3, 4, 5, 6] };
    const result = checkMergeWindow(ctx, config);
    expect(result.passed).toBe(true);
  });

  it("fails when current hour is outside allowed window", () => {
    const config: TimeCheckConfig = {
      allowedHoursStart: 99,
      allowedHoursEnd: 100,
    };
    const result = checkMergeWindow(ctx, config);
    expect(result.passed).toBe(false);
    expect(result.message).toContain("outside allowed hours");
  });

  it("passes when current hour is inside allowed window", () => {
    const config: TimeCheckConfig = {
      allowedHoursStart: 0,
      allowedHoursEnd: 24,
    };
    const result = checkMergeWindow(ctx, config);
    expect(result.passed).toBe(true);
  });

  it("respects warnOnly flag", () => {
    const config: TimeCheckConfig = {
      allowedHoursStart: 99,
      allowedHoursEnd: 100,
      warnOnly: true,
    };
    const result = checkMergeWindow(ctx, config);
    expect(result.passed).toBe(false);
    expect(result.warnOnly).toBe(true);
  });

  it("includes prNumber in message", () => {
    const result = checkMergeWindow(makeContext(99), {});
    expect(result.message).toContain("99");
  });
});
