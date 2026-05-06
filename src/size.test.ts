import { categorizePRSize, checkPRSize, SizeConfig } from './size';
import { PRContext } from './types';

function makeContext(overrides: Partial<PRContext> = {}): PRContext {
  return {
    title: 'Test PR',
    description: '',
    labels: [],
    additions: 0,
    deletions: 0,
    changedFiles: 0,
    author: 'user',
    baseBranch: 'main',
    headBranch: 'feature/test',
    ...overrides,
  } as PRContext;
}

describe('categorizePRSize', () => {
  it('returns XS for <= 10 changes', () => {
    expect(categorizePRSize(5, 3)).toBe('XS');
  });

  it('returns S for <= 50 changes', () => {
    expect(categorizePRSize(30, 10)).toBe('S');
  });

  it('returns M for <= 250 changes', () => {
    expect(categorizePRSize(200, 20)).toBe('M');
  });

  it('returns L for <= 1000 changes', () => {
    expect(categorizePRSize(500, 400)).toBe('L');
  });

  it('returns XL for > 1000 changes', () => {
    expect(categorizePRSize(800, 400)).toBe('XL');
  });
});

describe('checkPRSize', () => {
  it('passes when within all limits', () => {
    const ctx = makeContext({ additions: 10, deletions: 5, changedFiles: 3 });
    const config: SizeConfig = { maxAdditions: 50, maxDeletions: 50, maxChangedFiles: 10 };
    const result = checkPRSize(ctx, config);
    expect(result.passed).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when additions exceed limit', () => {
    const ctx = makeContext({ additions: 100, deletions: 0, changedFiles: 1 });
    const config: SizeConfig = { maxAdditions: 50 };
    const result = checkPRSize(ctx, config);
    expect(result.passed).toBe(false);
    expect(result.errors[0]).toContain('100 additions');
  });

  it('warns instead of failing when warnOnly is true', () => {
    const ctx = makeContext({ additions: 200, deletions: 0, changedFiles: 1 });
    const config: SizeConfig = { maxAdditions: 50, warnOnly: true };
    const result = checkPRSize(ctx, config);
    expect(result.passed).toBe(true);
    expect(result.warnings[0]).toContain('200 additions');
  });

  it('fails when changed files exceed limit', () => {
    const ctx = makeContext({ additions: 5, deletions: 5, changedFiles: 20 });
    const config: SizeConfig = { maxChangedFiles: 10 };
    const result = checkPRSize(ctx, config);
    expect(result.passed).toBe(false);
    expect(result.errors[0]).toContain('20 files');
  });
});
