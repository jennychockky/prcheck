import * as core from '@actions/core';
import { evaluateMilestoneResults, runMilestoneEnforcement } from './milestonecheck';
import { MilestoneResult } from './types';

jest.mock('@actions/core');

const mockCore = core as jest.Mocked<typeof core>;

beforeEach(() => jest.clearAllMocks());

describe('evaluateMilestoneResults', () => {
  it('returns passed=true when all results pass', () => {
    const results: MilestoneResult[] = [
      { passed: true, message: 'ok' },
      { passed: true, message: 'also ok' },
    ];
    const { passed, failures } = evaluateMilestoneResults(results);
    expect(passed).toBe(true);
    expect(failures).toHaveLength(0);
  });

  it('returns failures when any result fails', () => {
    const results: MilestoneResult[] = [
      { passed: false, message: 'No milestone' },
      { passed: true, message: 'Pattern ok' },
    ];
    const { passed, failures } = evaluateMilestoneResults(results);
    expect(passed).toBe(false);
    expect(failures).toContain('No milestone');
  });
});

describe('runMilestoneEnforcement', () => {
  it('sets output to true when milestone passes', async () => {
    const milestone = { title: 'v1.0.0', number: 1 };
    const result = await runMilestoneEnforcement(milestone, { required: true, pattern: '^v\\d+' });
    expect(result).toBe(true);
    expect(mockCore.setOutput).toHaveBeenCalledWith('milestone_passed', 'true');
  });

  it('sets output to false when milestone is missing and required', async () => {
    const result = await runMilestoneEnforcement(null, { required: true });
    expect(result).toBe(false);
    expect(mockCore.setOutput).toHaveBeenCalledWith('milestone_passed', 'false');
  });

  it('logs info for passing checks', async () => {
    const milestone = { title: 'v2.0.0', number: 2 };
    await runMilestoneEnforcement(milestone, { required: false });
    expect(mockCore.info).toHaveBeenCalled();
  });
});
