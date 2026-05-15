import { countTasks, formatTaskSummary } from "./task";
import { runTaskCheck, loadTaskCheckConfig, TaskCheckConfig } from "./taskcheck";
import { PRContext } from "./types";

function makeContext(body: string, labels: string[] = []): PRContext {
  return {
    title: "Test PR",
    body,
    labels,
    author: "user",
    number: 1,
    baseBranch: "main",
    headBranch: "feature/test",
    isDraft: false,
  } as PRContext;
}

describe("countTasks", () => {
  it("returns zero for empty body", () => {
    expect(countTasks("")).toEqual({ total: 0, completed: 0, incomplete: [] });
  });

  it("counts checked and unchecked tasks", () => {
    const body = "- [x] Done\n- [ ] Not done\n- [X] Also done";
    const result = countTasks(body);
    expect(result.total).toBe(3);
    expect(result.completed).toBe(2);
    expect(result.incomplete).toEqual(["Not done"]);
  });

  it("ignores non-task lines", () => {
    const body = "Some text\n- [x] Task\nMore text";
    expect(countTasks(body).total).toBe(1);
  });
});

describe("formatTaskSummary", () => {
  it("returns no tasks message when total is 0", () => {
    expect(formatTaskSummary({ total: 0, completed: 0, incomplete: [] })).toBe("No tasks found.");
  });

  it("includes incomplete tasks in output", () => {
    const summary = { total: 2, completed: 1, incomplete: ["Fix tests"] };
    const output = formatTaskSummary(summary);
    expect(output).toContain("1/2 completed");
    expect(output).toContain("Fix tests");
  });
});

describe("runTaskCheck", () => {
  const baseConfig: TaskCheckConfig = {
    requireAllTasksCompleted: true,
  };

  it("passes when no tasks are present", () => {
    const ctx = makeContext("No tasks here.");
    expect(runTaskCheck(baseConfig, ctx).passed).toBe(true);
  });

  it("fails when tasks are incomplete and requireAll is true", () => {
    const ctx = makeContext("- [x] Done\n- [ ] Not done");
    const result = runTaskCheck(baseConfig, ctx);
    expect(result.passed).toBe(false);
    expect(result.message).toContain("1/2");
  });

  it("passes when all tasks are completed", () => {
    const ctx = makeContext("- [x] Done\n- [x] Also done");
    expect(runTaskCheck(baseConfig, ctx).passed).toBe(true);
  });

  it("skips check when ignore label is present", () => {
    const ctx = makeContext("- [ ] Not done", ["skip-task-check"]);
    const config: TaskCheckConfig = { requireAllTasksCompleted: true, ignoreLabels: ["skip-task-check"] };
    expect(runTaskCheck(config, ctx).passed).toBe(true);
  });

  it("fails when ratio is below minimum", () => {
    const ctx = makeContext("- [x] Done\n- [ ] A\n- [ ] B\n- [ ] C");
    const config: TaskCheckConfig = { requireAllTasksCompleted: false, minCompletedRatio: 0.5 };
    const result = runTaskCheck(config, ctx);
    expect(result.passed).toBe(false);
    expect(result.message).toContain("50%");
  });
});
