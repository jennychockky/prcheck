import { getApprovals, checkApprovalCount, ApprovalResult } from './approvals';

const makeClient = (reviews: Array<{ user: { login: string }; state: string }>) =>
  ({
    rest: {
      pulls: {
        listReviews: jest.fn().mockResolvedValue({ data: reviews }),
      },
    },
  } as any);

const repo = { owner: 'org', repo: 'repo' };

describe('getApprovals', () => {
  it('returns approved when at least one approval exists', async () => {
    const client = makeClient([{ user: { login: 'alice' }, state: 'APPROVED' }]);
    const result = await getApprovals(client, repo, 1);
    expect(result.approved).toBe(true);
    expect(result.approvalCount).toBe(1);
    expect(result.reviewers).toContain('alice');
  });

  it('returns not approved when no approvals exist', async () => {
    const client = makeClient([{ user: { login: 'bob' }, state: 'CHANGES_REQUESTED' }]);
    const result = await getApprovals(client, repo, 1);
    expect(result.approved).toBe(false);
    expect(result.approvalCount).toBe(0);
  });

  it('uses latest review state per user', async () => {
    const client = makeClient([
      { user: { login: 'alice' }, state: 'CHANGES_REQUESTED' },
      { user: { login: 'alice' }, state: 'APPROVED' },
    ]);
    const result = await getApprovals(client, repo, 1);
    expect(result.approvalCount).toBe(1);
  });

  it('tracks dismissed reviewers', async () => {
    const client = makeClient([{ user: { login: 'carol' }, state: 'DISMISSED' }]);
    const result = await getApprovals(client, repo, 1);
    expect(result.dismissedReviewers).toContain('carol');
    expect(result.approvalCount).toBe(0);
  });

  it('handles multiple approvers', async () => {
    const client = makeClient([
      { user: { login: 'alice' }, state: 'APPROVED' },
      { user: { login: 'bob' }, state: 'APPROVED' },
    ]);
    const result = await getApprovals(client, repo, 1);
    expect(result.approvalCount).toBe(2);
  });
});

describe('checkApprovalCount', () => {
  const base: ApprovalResult = {
    approved: true,
    approvalCount: 2,
    requiredApprovals: 1,
    reviewers: ['alice', 'bob'],
    dismissedReviewers: [],
  };

  it('passes when approval count meets requirement', () => {
    const { passed } = checkApprovalCount(base, 2);
    expect(passed).toBe(true);
  });

  it('fails when approval count is below requirement', () => {
    const { passed, message } = checkApprovalCount({ ...base, approvalCount: 1 }, 2);
    expect(passed).toBe(false);
    expect(message).toMatch(/1 more approval/);
  });

  it('includes counts in success message', () => {
    const { message } = checkApprovalCount(base, 2);
    expect(message).toMatch(/2 approval/);
  });
});
