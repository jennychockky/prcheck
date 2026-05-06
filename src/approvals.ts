import * as github from '@actions/github';
import { RepoInfo } from './types';

export interface ApprovalResult {
  approved: boolean;
  approvalCount: number;
  requiredApprovals: number;
  reviewers: string[];
  dismissedReviewers: string[];
}

export async function getApprovals(
  client: ReturnType<typeof github.getOctokit>,
  repo: RepoInfo,
  prNumber: number
): Promise<ApprovalResult> {
  const { data: reviews } = await client.rest.pulls.listReviews({
    owner: repo.owner,
    repo: repo.repo,
    pull_number: prNumber,
  });

  const latestReviewByUser = new Map<string, string>();
  for (const review of reviews) {
    const login = review.user?.login;
    if (login && review.state) {
      latestReviewByUser.set(login, review.state);
    }
  }

  const approvers: string[] = [];
  const dismissed: string[] = [];

  for (const [user, state] of latestReviewByUser.entries()) {
    if (state === 'APPROVED') {
      approvers.push(user);
    } else if (state === 'DISMISSED') {
      dismissed.push(user);
    }
  }

  return {
    approved: approvers.length > 0,
    approvalCount: approvers.length,
    requiredApprovals: 1,
    reviewers: approvers,
    dismissedReviewers: dismissed,
  };
}

export function checkApprovalCount(
  result: ApprovalResult,
  required: number
): { passed: boolean; message: string } {
  const passed = result.approvalCount >= required;
  const message = passed
    ? `PR has ${result.approvalCount} approval(s) (required: ${required})`
    : `PR needs ${required - result.approvalCount} more approval(s) (has: ${result.approvalCount}, required: ${required})`;
  return { passed, message };
}
