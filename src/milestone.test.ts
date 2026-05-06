import { checkMilestoneRequired, checkMilestonePattern, runMilestoneChecks } from './milestone';
import { MilestoneConfig } from './types';

const mockMilestone = { title: 'v1.2.0', number: 5 };

describe('checkMilestoneRequired', () => {
  it('passes when milestone is not required', () => {
    const result = checkMilestoneRequired(null, { required: false });
    expect(result.passed).toBe(true);
  });

  it('fails when milestone is required but missing', () => {
    const result = checkMilestoneRequired(null, { required: true });
    expect(result.passed).toBe(false);
    expect(result.message).toContain('must have a milestone');
  });

  it('passes when milestone is required and present', () => {
    const result = checkMilestoneRequired(mockMilestone, { required: true });
    expect(result.passed).toBe(true);
    expect(result.message).toContain('v1.2.0');
  });
});

describe('checkMilestonePattern', () => {
  it('passes when no pattern is configured', () => {
    const result = checkMilestonePattern(mockMilestone, undefined);
    expect(result.passed).toBe(true);
  });

  it('passes when milestone matches pattern', () => {
    const result = checkMilestonePattern(mockMilestone, '^v\\d+\\.\\d+\\.\\d+$');
    expect(result.passed).toBe(true);
  });

  it('fails when milestone does not match pattern', () => {
    const result = checkMilestonePattern(mockMilestone, '^sprint-\\d+$');
    expect(result.passed).toBe(false);
    expect(result.message).toContain('does not match');
  });

  it('passes when milestone is null and pattern is set', () => {
    const result = checkMilestonePattern(null, '^v\\d+');
    expect(result.passed).toBe(true);
  });
});

describe('runMilestoneChecks', () => {
  it('returns two results', () => {
    const config: MilestoneConfig = { required: true, pattern: '^v\\d+' };
    const results = runMilestoneChecks(mockMilestone, config);
    expect(results).toHaveLength(2);
  });

  it('all pass with valid milestone and config', () => {
    const config: MilestoneConfig = { required: true, pattern: '^v\\d+\\.\\d+\\.\\d+$' };
    const results = runMilestoneChecks(mockMilestone, config);
    expect(results.every((r) => r.passed)).toBe(true);
  });

  it('first check fails when milestone missing and required', () => {
    const config: MilestoneConfig = { required: true };
    const results = runMilestoneChecks(null, config);
    expect(results[0].passed).toBe(false);
  });
});
