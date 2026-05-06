import {
  checkTitlePattern,
  checkTitleLength,
  checkForbiddenPrefixes,
  runTitleChecks,
} from './titlecheck';

jest.mock('@actions/core', () => ({
  warning: jest.fn(),
  info: jest.fn(),
}));

describe('checkTitlePattern', () => {
  it('passes when title matches pattern', () => {
    const result = checkTitlePattern('feat: add new feature', '^(feat|fix|chore):');
    expect(result.passed).toBe(true);
  });

  it('fails when title does not match pattern', () => {
    const result = checkTitlePattern('added stuff', '^(feat|fix|chore):');
    expect(result.passed).toBe(false);
    expect(result.message).toContain('does not match required pattern');
  });
});

describe('checkTitleLength', () => {
  it('passes when title meets min length', () => {
    const result = checkTitleLength('fix: something', 5);
    expect(result.passed).toBe(true);
  });

  it('fails when title is too short', () => {
    const result = checkTitleLength('hi', 10);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('too short');
  });

  it('fails when title exceeds max length', () => {
    const result = checkTitleLength('a'.repeat(80), undefined, 72);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('too long');
  });

  it('passes when title is within both bounds', () => {
    const result = checkTitleLength('fix: reasonable title', 5, 72);
    expect(result.passed).toBe(true);
  });
});

describe('checkForbiddenPrefixes', () => {
  it('fails when title starts with forbidden prefix', () => {
    const result = checkForbiddenPrefixes('WIP: not ready', ['WIP', 'DRAFT']);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('WIP');
  });

  it('passes when title has no forbidden prefix', () => {
    const result = checkForbiddenPrefixes('feat: ready to merge', ['WIP', 'DRAFT']);
    expect(result.passed).toBe(true);
  });

  it('is case-insensitive', () => {
    const result = checkForbiddenPrefixes('wip: still working', ['WIP']);
    expect(result.passed).toBe(false);
  });
});

describe('runTitleChecks', () => {
  it('returns empty array when no config rules are set', () => {
    const results = runTitleChecks('anything goes', {});
    expect(results).toHaveLength(0);
  });

  it('runs all configured checks', () => {
    const results = runTitleChecks('WIP: x', {
      pattern: '^(feat|fix):',
      minLength: 10,
      forbiddenPrefixes: ['WIP'],
    });
    expect(results).toHaveLength(3);
    expect(results.every((r) => !r.passed)).toBe(true);
  });

  it('passes all checks for a valid title', () => {
    const results = runTitleChecks('feat: implement login flow', {
      pattern: '^(feat|fix|chore):',
      minLength: 5,
      maxLength: 72,
      forbiddenPrefixes: ['WIP', 'DRAFT'],
    });
    expect(results.every((r) => r.passed)).toBe(true);
  });
});
