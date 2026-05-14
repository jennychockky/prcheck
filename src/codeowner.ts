import * as core from "@actions/core";
import { PRContext } from "./types";

export interface CodeOwnerResult {
  pass: boolean;
  required: string[];
  approved: string[];
  missing: string[];
  message: string;
}

/**
 * Parse a CODEOWNERS file content into a map of pattern -> owners.
 */
export function parseCodeowners(content: string): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const parts = line.split(/\s+/);
    if (parts.length < 2) continue;
    const pattern = parts[0];
    const owners = parts.slice(1).map((o) => o.replace(/^@/, "").toLowerCase());
    map.set(pattern, owners);
  }
  return map;
}

/**
 * Resolve which owners are required for the given list of changed files.
 */
export function resolveRequiredOwners(
  changedFiles: string[],
  codeowners: Map<string, string[]>
): string[] {
  const required = new Set<string>();
  for (const file of changedFiles) {
    for (const [pattern, owners] of codeowners) {
      const regex = new RegExp(
        "^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "($|/)"
      );
      if (regex.test(file)) {
        owners.forEach((o) => required.add(o));
      }
    }
  }
  return Array.from(required);
}

/**
 * Check whether all required code owners have approved the PR.
 */
export function checkCodeOwnerApprovals(
  ctx: PRContext,
  changedFiles: string[],
  codeownersContent: string,
  approvedBy: string[]
): CodeOwnerResult {
  const codeowners = parseCodeowners(codeownersContent);
  const required = resolveRequiredOwners(changedFiles, codeowners);
  const normalizedApprovals = approvedBy.map((a) => a.toLowerCase());
  const missing = required.filter((o) => !normalizedApprovals.includes(o));
  const approved = required.filter((o) => normalizedApprovals.includes(o));
  const pass = missing.length === 0;
  const message = pass
    ? `All required code owners have approved (${approved.join(", ") || "none required"})`
    : `Missing approvals from code owners: ${missing.map((o) => "@" + o).join(", ")}`;
  return { pass, required, approved, missing, message };
}

export function logCodeOwnerResult(result: CodeOwnerResult): void {
  if (result.pass) {
    core.info(`[codeowner] ✅ ${result.message}`);
  } else {
    core.warning(`[codeowner] ❌ ${result.message}`);
  }
}
