export interface TaskSummary {
  total: number;
  completed: number;
  incomplete: string[];
}

// Matches GitHub-style task list items: `- [ ]` or `- [x]` (case-insensitive)
const TASK_PATTERN = /^\s*-\s*\[([ xX])\]\s+(.*)$/gm;

export function countTasks(body: string): TaskSummary {
  const incomplete: string[] = [];
  let total = 0;
  let completed = 0;

  let match: RegExpExecArray | null;
  const re = new RegExp(TASK_PATTERN.source, TASK_PATTERN.flags);

  while ((match = re.exec(body)) !== null) {
    total++;
    const checked = match[1].toLowerCase() === "x";
    const label = match[2].trim();
    if (checked) {
      completed++;
    } else {
      incomplete.push(label);
    }
  }

  return { total, completed, incomplete };
}

export function logTaskResult(result: { passed: boolean; message: string }): void {
  if (result.passed) {
    console.log(`[task] ✅ ${result.message}`);
  } else {
    console.warn(`[task] ❌ ${result.message}`);
  }
}

export function formatTaskSummary(summary: TaskSummary): string {
  if (summary.total === 0) {
    return "No tasks found.";
  }
  const lines = [
    `Tasks: ${summary.completed}/${summary.total} completed.`,
  ];
  if (summary.incomplete.length > 0) {
    lines.push("Incomplete tasks:");
    summary.incomplete.forEach((t) => lines.push(`  - [ ] ${t}`));
  }
  return lines.join("\n");
}
