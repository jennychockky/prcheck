import * as github from '@actions/github';
import { PRContext } from './types';

export function extractPRContext(): PRContext {
  const payload = github.context.payload;

  if (!payload.pull_request) {
    throw new Error('This action must be run in the context of a pull_request event.');
  }

  const pr = payload.pull_request;

  return {
    title: pr.title as string,
    description: (pr.body as string | null) ?? '',
    labels: ((pr.labels as Array<{ name: string }>) ?? []).map((l) => l.name),
    author: (pr.user?.login as string) ?? 'unknown',
  };
}

export function isPullRequestEvent(): boolean {
  return github.context.eventName === 'pull_request' ||
    github.context.eventName === 'pull_request_target';
}

export function getPRNumber(): number | undefined {
  return github.context.payload.pull_request?.number;
}

export function getRepoInfo(): { owner: string; repo: string } {
  const { owner, repo } = github.context.repo;
  return { owner, repo };
}
