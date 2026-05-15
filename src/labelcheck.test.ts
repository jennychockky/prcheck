import { runLabelCheck, LabelCheckConfig } from "./labelcheck";
import { PRContext } from "./types";

function makeContext(labels: string[]): PRContext {
  return {
    title: "Test PR",
    body: "",
    labels,
    author: "user",
    isDraft: false,
    number: 1,
    baseBranch: "main",
    headBranch: "feature/test",
  } as PRContext;
}

const baseConfig: LabelCheckConfig = {
  required: [],
  forbidden: [],
  requireAtLeastOne: [],
  minCount: 0,
  maxCount: 10,
};

describe("runLabelCheck", () => {
  it("passes when no constraints and no labels", () => {
    const result = runLabelCheck(makeContext([]), baseConfig);
    expect(result.passed).toBe(true);
    expect(result.message).toBe("All label checks passed");
  });

  it("fails when required label is missing", () => {
    const config = { ...baseConfig, required: ["bug", "reviewed"] };
    const result = runLabelCheck(makeContext(["bug"]), config);
    expect(result.passed).toBe(false);
    expect(result.missing).toEqual(["reviewed"]);
    expect(result.message).toContain("reviewed");
  });

  it("fails when forbidden label is present", () => {
    const config = { ...baseConfig, forbidden: ["wip", "do-not-merge"] };
    const result = runLabelCheck(makeContext(["bug", "wip"]), config);
    expect(result.passed).toBe(false);
    expect(result.forbidden).toEqual(["wip"]);
    expect(result.message).toContain("wip");
  });

  it("fails when none of required group labels are present", () => {
    const config = { ...baseConfig, requireAtLeastOne: [["type:bug", "type:feat", "type:chore"]] };
    const result = runLabelCheck(makeContext(["reviewed"]), config);
    expect(result.passed).toBe(false);
    expect(result.unsatisfiedGroups).toHaveLength(1);
  });

  it("passes when at least one label from group is present", () => {
    const config = { ...baseConfig, requireAtLeastOne: [["type:bug", "type:feat"]] };
    const result = runLabelCheck(makeContext(["type:feat"]), config);
    expect(result.passed).toBe(true);
  });

  it("fails when label count is below minCount", () => {
    const config = { ...baseConfig, minCount: 2 };
    const result = runLabelCheck(makeContext(["bug"]), config);
    expect(result.passed).toBe(false);
    expect(result.message).toContain("minimum is 2");
  });

  it("fails when label count exceeds maxCount", () => {
    const config = { ...baseConfig, maxCount: 2 };
    const result = runLabelCheck(makeContext(["a", "b", "c"]), config);
    expect(result.passed).toBe(false);
    expect(result.message).toContain("maximum is 2");
  });

  it("reports multiple issues in message", () => {
    const config = { ...baseConfig, required: ["reviewed"], forbidden: ["wip"] };
    const result = runLabelCheck(makeContext(["wip"]), config);
    expect(result.passed).toBe(false);
    expect(result.message).toContain("reviewed");
    expect(result.message).toContain("wip");
  });
});
