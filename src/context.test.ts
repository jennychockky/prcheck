import * as github from '@actions/github';
import { extractPRContext, isPullRequestEvent, getPRNumber, getRepoInfo } from './context';

jest.mock('@actions/github', () => ({
  context: {
    eventName: 'pull_request',
    repo: { owner: 'testowner', repo: 'testrepo' },
    payload: {
      pull_request: {
        title: 'fix: resolve issue',
        body: '## Summary\nFixed the bug.',
        labels: [{ name: 'bug' }, { name: 'fix' }],
        user: { login: 'devuser' },
        number: 42,
      },
    },
  },
}));

describe('extractPRContext', () => {
  it('extracts title, description, labels, and author from payload', () => {
    const ctx = extractPRContext();
    expect(ctx.title).toBe('fix: resolve issue');
    expect(ctx.description).toBe('## Summary\nFixed the bug.');
    expect(ctx.labels).toEqual(['bug', 'fix']);
    expect(ctx.author).toBe('devuser');
  });

  it('throws when not in a pull_request context', () => {
    const original = (github.context as any).payload.pull_request;
    (github.context as any).payload.pull_request = undefined;
    expect(() => extractPRContext()).toThrow('pull_request event');
    (github.context as any).payload.pull_request = original;
  });

  it('defaults description to empty string when body is null', () => {
    (github.context as any).payload.pull_request.body = null;
    const ctx = extractPRContext();
    expect(ctx.description).toBe('');
    (github.context as any).payload.pull_request.body = '## Summary\nFixed the bug.';
  });
});

describe('isPullRequestEvent', () => {
  it('returns true for pull_request event', () => {
    expect(isPullRequestEvent()).toBe(true);
  });

  it('returns false for push event', () => {
    (github.context as any).eventName = 'push';
    expect(isPullRequestEvent()).toBe(false);
    (github.context as any).eventName = 'pull_request';
  });
});

describe('getPRNumber', () => {
  it('returns PR number from payload', () => {
    expect(getPRNumber()).toBe(42);
  });
});

describe('getRepoInfo', () => {
  it('returns owner and repo from context', () => {
    expect(getRepoInfo()).toEqual({ owner: 'testowner', repo: 'testrepo' });
  });
});
