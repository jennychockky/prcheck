import * as core from "@actions/core";
import { PRContext } from "./types";

export interface TaskCheckConfig {
  requireAllTasksCompleted: boolean;
  minCompletedRatio?: number; // 0.0 to 1.0
  ignoreLabels?: string[];
}

export function loadTaskCheckConfig(): TaskCheckConfig {
  const requireAll = core.getInput("require_all_tasks_completed");
  const minRatio = core.getInput("min_tasks_completed_ratio");
  const ignoreLabels = core.getInput("task_ignore_labels");

  return {
    requireAllTasksCompleted: requireAll !== "false",
    minCompletedRatio: minRatio ? parseFloat(minRatio) : undefined,
    ignoreLabels: ignoreLabels ? ignoreLabels.split(",").map((l) => l.trim()) : [],
  };
}

export function runTaskCheck(
  config: TaskCheckConfig,
  context: PRContext
): { passed: boolean; message: string } {
  const labels = context.labels ?? [];

  if (
    config.ignoreLabels &&
    config.ignoreLabels.some((il) => labels.includes(il))
  ) {
    return { passed: true, message: "Task check skipped due to ignore label." };
  }

  const { total, completed } = countTasks(context.body ?? "");

  if (total === 0) {
    return { passed: true, message: "No tasks found in PR description." };
  }

  if (config.requireAllTasksCompleted && completed < total) {
    return {
      passed: false,
      message: `Task check failed: ${completed}/${total} tasks completed. All tasks must be checked.`,
    };
  }

  if (config.minCompletedRatio !== undefined) {
    const ratio = completed / total;
    if (ratio < config.minCompletedRatio) {
      const pct = Math.round(config.minCompletedRatio * 100);
      return {
        passed: false,
        message: `Task check failed: ${completed}/${total} tasks completed (${Math.round(ratio * 100)}%). Minimum required: ${pct}%.`,
      };
    }
  }

  return {
    passed: true,
    message: `Task check passed: ${completed}/${total} tasks completed.`,
  };
}
