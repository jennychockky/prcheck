import * as core from "@actions/core";

import { PRContext } from "./types";

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchedPR?: number;
  similarity: number;
  passed: boolean;
  message: string;
}

export function normalizeTitleForComparison(title: string): string {
  return title
    .toLowerCase()
    .replace(/^(fix|feat|chore|docs|refactor|test|style|ci):\s*/i, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function computeSimilarity(a: string, b: string): number {
  const na = normalizeTitleForComparison(a);
  const nb = normalizeTitleForComparison(b);
  if (na === nb) return 1.0;
  const wordsA = new Set(na.split(" "));
  const wordsB = new Set(nb.split(" "));
  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return union === 0 ? 0 : intersection / union;
}

export function checkDuplicatePR(
  context: PRContext,
  openPRTitles: Array<{ number: number; title: string }>,
  threshold = 0.8
): DuplicateCheckResult {
  const candidates = openPRTitles.filter((pr) => pr.number !== context.prNumber);

  let bestMatch: { number: number; similarity: number } | null = null;

  for (const pr of candidates) {
    const similarity = computeSimilarity(context.title, pr.title);
    if (!bestMatch || similarity > bestMatch.similarity) {
      bestMatch = { number: pr.number, similarity };
    }
  }

  const isDuplicate = bestMatch !== null && bestMatch.similarity >= threshold;

  return {
    isDuplicate,
    matchedPR: isDuplicate ? bestMatch!.number : undefined,
    similarity: bestMatch?.similarity ?? 0,
    passed: !isDuplicate,
    message: isDuplicate
      ? `PR title is too similar to #${bestMatch!.number} (similarity: ${(bestMatch!.similarity * 100).toFixed(0)}%)`
      : "No duplicate PRs detected.",
  };
}

export function logDuplicateResult(result: DuplicateCheckResult): void {
  if (!result.passed) {
    core.warning(`[duplicate] ${result.message}`);
  } else {
    core.info(`[duplicate] ${result.message}`);
  }
}
