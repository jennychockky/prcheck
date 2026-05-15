import * as core from "@actions/core";
import { PRContext } from "./types";

export interface ScopeConfig {
  allowedScopes: string[];
  requireScope: boolean;
  labelPrefix?: string;
}

export interface ScopeResult {
  passed: boolean;
  scope: string | null;
  message: string;
}

export function loadScopeConfig(): ScopeConfig {
  const raw = core.getInput("allowed_scopes");
  const allowedScopes = raw
    ? raw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const requireScope = core.getInput("require_scope") === "true";
  const labelPrefix = core.getInput("scope_label_prefix") || undefined;
  return { allowedScopes, requireScope, labelPrefix };
}

export function extractScopeFromTitle(title: string): string | null {
  const match = title.match(/^[a-z]+\(([^)]+)\):/);
  return match ? match[1] : null;
}

export function runScopeCheck(context: PRContext, config: ScopeConfig): ScopeResult {
  const scope = extractScopeFromTitle(context.title);

  if (config.requireScope && !scope) {
    return {
      passed: false,
      scope: null,
      message: "PR title is missing a required scope, e.g. feat(scope): description",
    };
  }

  if (scope && config.allowedScopes.length > 0 && !config.allowedScopes.includes(scope)) {
    return {
      passed: false,
      scope,
      message: `Scope "${scope}" is not in the allowed list: ${config.allowedScopes.join(", ")}.`,
    };
  }

  if (config.labelPrefix && scope) {
    const expectedLabel = `${config.labelPrefix}${scope}`;
    const hasLabel = context.labels.includes(expectedLabel);
    if (!hasLabel) {
      return {
        passed: false,
        scope,
        message: `Expected label "${expectedLabel}" for scope "${scope}" is missing.`,
      };
    }
  }

  return {
    passed: true,
    scope,
    message: scope ? `Scope "${scope}" is valid.` : "No scope required.",
  };
}
