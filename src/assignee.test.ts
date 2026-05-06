import { checkAssignees, AssigneeConfig } from "./assignee";

describe("checkAssignees", () => {
  const baseConfig: AssigneeConfig = {
    required: true,
    minCount: 1,
  };

  it("passes when not required", () => {
    const result = checkAssignees([], { ...baseConfig, required: false });
    expect(result.passed).toBe(true);
    expect(result.required).toBe(false);
    expect(result.message).toContain("skipped");
  });

  it("fails when required and no assignees", () => {
    const result = checkAssignees([], baseConfig);
    expect(result.passed).toBe(false);
    expect(result.hasAssignee).toBe(false);
    expect(result.message).toContain("at least 1");
  });

  it("passes with one assignee when minCount is 1", () => {
    const result = checkAssignees(["alice"], baseConfig);
    expect(result.passed).toBe(true);
    expect(result.assignees).toEqual(["alice"]);
  });

  it("fails when fewer assignees than minCount", () => {
    const result = checkAssignees(["alice"], { ...baseConfig, minCount: 2 });
    expect(result.passed).toBe(false);
    expect(result.message).toContain("at least 2");
  });

  it("passes when assignees meet minCount", () => {
    const result = checkAssignees(["alice", "bob"], { ...baseConfig, minCount: 2 });
    expect(result.passed).toBe(true);
    expect(result.assignees).toHaveLength(2);
  });

  it("fails when assignee not in allowedAssignees", () => {
    const result = checkAssignees(["charlie"], {
      ...baseConfig,
      allowedAssignees: ["alice", "bob"],
    });
    expect(result.passed).toBe(false);
    expect(result.message).toContain("charlie");
  });

  it("passes when all assignees are in allowedAssignees", () => {
    const result = checkAssignees(["alice"], {
      ...baseConfig,
      allowedAssignees: ["alice", "bob"],
    });
    expect(result.passed).toBe(true);
  });

  it("returns correct assignees list in result", () => {
    const result = checkAssignees(["alice", "bob"], baseConfig);
    expect(result.assignees).toEqual(["alice", "bob"]);
    expect(result.hasAssignee).toBe(true);
  });
});
