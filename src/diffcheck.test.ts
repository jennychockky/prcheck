import { checkDiffSize, checkBlockedFiles } from './diffcheck';
import { DiffSummary, FileDiff } from './diff';

const mockSummary: DiffSummary = {
  totalFiles: 5,
  totalAdditions: 200,
  totalDeletions: 50,
  files: [],
};

describe('checkDiffSize', () => {
  it('passes when all limits are satisfied', () => {
    const result = checkDiffSize(mockSummary, {
      maxChangedFiles: 10,
      maxAdditions: 500,
      maxDeletions: 100,
    });
    expect(result.passed).toBe(true);
    expect(result.messages).toHaveLength(0);
  });

  it('fails when too many files changed', () => {
    const result = checkDiffSize(mockSummary, { maxChangedFiles: 3 });
    expect(result.passed).toBe(false);
    expect(result.messages[0]).toMatch(/5 files/);
  });

  it('fails when too many additions', () => {
    const result = checkDiffSize(mockSummary, { maxAdditions: 100 });
    expect(result.passed).toBe(false);
    expect(result.messages[0]).toMatch(/200 lines/);
  });

  it('fails when too many deletions', () => {
    const result = checkDiffSize(mockSummary, { maxDeletions: 10 });
    expect(result.passed).toBe(false);
    expect(result.messages[0]).toMatch(/50 lines/);
  });

  it('passes with no limits configured', () => {
    const result = checkDiffSize(mockSummary, {});
    expect(result.passed).toBe(true);
  });
});

describe('checkBlockedFiles', () => {
  const files: FileDiff[] = [
    { filename: 'src/secret.env', status: 'added', additions: 1, deletions: 0, changes: 1 },
    { filename: 'src/index.ts', status: 'modified', additions: 5, deletions: 1, changes: 6 },
  ];

  it('fails when a blocked file is present', () => {
    const result = checkBlockedFiles(files, ['\.env$']);
    expect(result.passed).toBe(false);
    expect(result.messages[0]).toMatch(/secret\.env/);
  });

  it('passes when no blocked files are present', () => {
    const result = checkBlockedFiles(files, ['\.pem$']);
    expect(result.passed).toBe(true);
  });

  it('passes with empty blocked patterns', () => {
    const result = checkBlockedFiles(files, []);
    expect(result.passed).toBe(true);
  });
});
