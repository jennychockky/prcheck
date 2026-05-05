import { checkTitle, checkLabels, runChecks, PRCheckInput } from './checks';

describe('checkTitle', () => {
  it('passes when no pattern is configured', () => {
    const result = checkTitle('any title');
    expect(result.passed).toBe(true);
  });

  it('passes when title matches pattern', () => {
    const result = checkTitle('feat: add new feature', '^(feat|fix|chore):');
    expect(result.passed).toBe(true);
  });

  it('fails when title does not match pattern', () => {
    const result = checkTitle('added stuff', '^(feat|fix|chore):');
    expect(result.passed).toBe(false);
    expect(result.message).toContain('^(feat|fix|chore):');
  });
});

describe('checkLabels', () => {
  it('passes when no required labels configured', () => {
    const result = checkLabels([], []);
    expect(result.passed).toBe(true);
  });

  it('passes when all required labels are present', () => {
    const result = checkLabels(['bug', 'ready'], ['bug']);
    expect(result.passed).toBe(true);
  });

  it('fails when required labels are missing', () => {
    const result = checkLabels(['bug'], ['bug', 'reviewed']);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('reviewed');
  });
});

describe('runChecks', () => {
  const baseInput: PRCheckInput = {
    title: 'feat: implement feature',
    description: '## Summary\nDone',
    labels: ['feature'],
    requiredLabels: ['feature'],
    requiredSections: [],
    titlePattern: '^(feat|fix|chore):',
  };

  it('returns passed when all checks succeed', () => {
    const output = runChecks(baseInput);
    expect(output.passed).toBe(true);
    expect(output.summary).toBe('All PR checks passed');
  });

  it('returns failed summary when checks fail', () => {
    const output = runChecks({ ...baseInput, title: 'bad title', labels: [] });
    expect(output.passed).toBe(false);
    expect(output.summary).toContain('check(s) failed');
  });

  it('includes individual results', () => {
    const output = runChecks(baseInput);
    expect(output.results).toHaveLength(2);
    expect(output.results.map((r) => r.name)).toContain('title');
    expect(output.results.map((r) => r.name)).toContain('labels');
  });
});
