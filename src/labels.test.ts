import * as core from '@actions/core';
import { checkRequiredLabels, LabelCheckResult } from './labels';

jest.mock('@actions/core');

const mockListLabels = jest.fn();
const mockOctokit = {
  rest: {
    issues: {
      listLabelsOnIssue: mockListLabels,
    },
  },
} as any;

const owner = 'test-owner';
const repo = 'test-repo';
const prNumber = 42;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('checkRequiredLabels', () => {
  it('returns passed=true when no required labels are configured', async () => {
    const result = await checkRequiredLabels(mockOctokit, owner, repo, prNumber, []);
    expect(result.passed).toBe(true);
    expect(result.missing).toEqual([]);
    expect(mockListLabels).not.toHaveBeenCalled();
  });

  it('returns passed=true when all required labels are present', async () => {
    mockListLabels.mockResolvedValue({
      data: [{ name: 'bug' }, { name: 'reviewed' }],
    });
    const result = await checkRequiredLabels(mockOctokit, owner, repo, prNumber, ['bug', 'reviewed']);
    expect(result.passed).toBe(true);
    expect(result.missing).toEqual([]);
    expect(result.present).toEqual(['bug', 'reviewed']);
  });

  it('returns passed=false with missing labels listed', async () => {
    mockListLabels.mockResolvedValue({
      data: [{ name: 'bug' }],
    });
    const result = await checkRequiredLabels(mockOctokit, owner, repo, prNumber, ['bug', 'reviewed']);
    expect(result.passed).toBe(false);
    expect(result.missing).toEqual(['reviewed']);
    expect(core.warning).toHaveBeenCalledWith(
      expect.stringContaining('reviewed')
    );
  });

  it('returns passed=false when no labels are present but some are required', async () => {
    mockListLabels.mockResolvedValue({ data: [] });
    const result = await checkRequiredLabels(mockOctokit, owner, repo, prNumber, ['approved']);
    expect(result.passed).toBe(false);
    expect(result.missing).toEqual(['approved']);
  });
});
