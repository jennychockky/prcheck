import * as core from "@actions/core";

export interface PRComment {
  id: number;
  body: string;
  user: string;
  isBot: boolean;
  resolved?: boolean;
}

export function countUnresolvedComments(comments: PRComment[]): number {
  return comments.filter((c) => c.resolved === false).length;
}

export function filterBotComments(comments: PRComment[]): PRComment[] {
  return comments.filter((c) => c.isBot);
}

export function checkCommentThreshold(
  unresolvedCount: number,
  maxAllowed: number
): boolean {
  return unresolvedCount <= maxAllowed;
}

export function logCommentResult(passed: boolean, message: string): void {
  if (passed) {
    core.info(`[comment] ✅ ${message}`);
  } else {
    core.warning(`[comment] ❌ ${message}`);
  }
}

export function hasForbiddenPhraseInComments(
  comments: PRComment[],
  phrases: string[]
): { found: boolean; phrase?: string } {
  for (const comment of comments) {
    for (const phrase of phrases) {
      if (comment.body.includes(phrase)) {
        return { found: true, phrase };
      }
    }
  }
  return { found: false };
}
