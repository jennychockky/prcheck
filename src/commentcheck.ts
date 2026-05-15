import * as core from "@actions/core";
import { PRContext } from "./types";

export interface CommentCheckConfig {
  requireResolved?: boolean;
  maxUnresolved?: number;
  forbiddenBotComments?: string[];
}

export function loadCommentConfig(): CommentCheckConfig {
  const requireResolved = core.getInput("require_resolved_comments") === "true";
  const maxUnresolvedRaw = core.getInput("max_unresolved_comments");
  const maxUnresolved = maxUnresolvedRaw ? parseInt(maxUnresolvedRaw, 10) : undefined;
  const forbiddenRaw = core.getInput("forbidden_bot_comments");
  const forbiddenBotComments = forbiddenRaw
    ? forbiddenRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return { requireResolved, maxUnresolved, forbiddenBotComments };
}

export function runCommentCheck(
  context: PRContext,
  config: CommentCheckConfig
): { passed: boolean; message: string } {
  const { unresolvedComments = 0, comments = [] } = context as any;

  if (config.requireResolved && unresolvedComments > 0) {
    return {
      passed: false,
      message: `PR has ${unresolvedComments} unresolved comment(s). All comments must be resolved before merge.`,
    };
  }

  if (config.maxUnresolved !== undefined && unresolvedComments > config.maxUnresolved) {
    return {
      passed: false,
      message: `PR has ${unresolvedComments} unresolved comment(s), exceeding the maximum of ${config.maxUnresolved}.`,
    };
  }

  if (config.forbiddenBotComments && config.forbiddenBotComments.length > 0) {
    for (const comment of comments) {
      for (const phrase of config.forbiddenBotComments) {
        if (comment.body?.includes(phrase)) {
          return {
            passed: false,
            message: `PR contains a bot comment with forbidden phrase: "${phrase}".`,
          };
        }
      }
    }
  }

  return { passed: true, message: "Comment checks passed." };
}
