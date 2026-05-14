import * as core from "@actions/core";
import { PRContext } from "./types";

export interface BodyCheckConfig {
  minLength?: number;
  maxLength?: number;
  forbiddenPhrases?: string[];
  requireChecklist?: boolean;
}

export interface BodyCheckResult {
  passed: boolean;
  minLengthOk: boolean;
  maxLengthOk: boolean;
  forbiddenPhrasesOk: boolean;
  checklistOk: boolean;
  bodyLength: number;
  violations: string[];
}

export function checkBodyLength(
  body: string,
  minLength?: number,
  maxLength?: number
): { minOk: boolean; maxOk: boolean } {
  const len = body.trim().length;
  const minOk = minLength === undefined || len >= minLength;
  const maxOk = maxLength === undefined || len <= maxLength;
  return { minOk, maxOk };
}

export function checkForbiddenPhrases(
  body: string,
  phrases: string[]
): string[] {
  const lower = body.toLowerCase();
  return phrases.filter((p) => lower.includes(p.toLowerCase()));
}

export function checkChecklist(body: string): boolean {
  return /- \[[ xX]\]/.test(body);
}

export function runBodyCheck(
  context: PRContext,
  config: BodyCheckConfig
): BodyCheckResult {
  const body = context.body ?? "";
  const { minOk, maxOk } = checkBodyLength(body, config.minLength, config.maxLength);
  const foundPhrases = checkForbiddenPhrases(body, config.forbiddenPhrases ?? []);
  const checklistOk = config.requireChecklist ? checkChecklist(body) : true;

  const violations: string[] = [];
  if (!minOk) violations.push(`Body too short (min ${config.minLength} chars)`);
  if (!maxOk) violations.push(`Body too long (max ${config.maxLength} chars)`);
  if (foundPhrases.length > 0)
    violations.push(`Forbidden phrases found: ${foundPhrases.join(", ")}`);
  if (!checklistOk) violations.push("Body must contain at least one checklist item");

  const passed = violations.length === 0;

  if (passed) {
    core.info("[bodycheck] PR body passed all checks");
  } else {
    violations.forEach((v) => core.warning(`[bodycheck] ${v}`));
  }

  return {
    passed,
    minLengthOk: minOk,
    maxLengthOk: maxOk,
    forbiddenPhrasesOk: foundPhrases.length === 0,
    checklistOk,
    bodyLength: body.trim().length,
    violations,
  };
}
