import { summarizeDiff, filterDiffByPattern, FileDiff } from './diff';

const mockFiles: FileDiff[] = [
  { filename: 'src/index.ts', status: 'modified', additions: 10, deletions: 2, changes: 12 },
  { filename: 'src/utils.ts', status: 'added', additions: 30, deletions: 0, changes: 30 },
  { filename: 'README.md', status: 'modified', additions: 5, deletions: 1, changes: 6 },
  { filename: 'test/index.test.ts', status: 'added', additions: 20, deletions: 0, changes: 20 },
];

describe('summarizeDiff', () => {
  it('counts total files', () => {
    const summary = summarizeDiff(mockFiles);
    expect(summary.totalFiles).toBe(4);
  });

  it('sums additions correctly', () => {
    const summary = summarizeDiff(mockFiles);
    expect(summary.totalAdditions).toBe(65);
  });

  it('sums deletions correctly', () => {
    const summary = summarizeDiff(mockFiles);
    expect(summary.totalDeletions).toBe(3);
  });

  it('returns empty summary for no files', () => {
    const summary = summarizeDiff([]);
    expect(summary.totalFiles).toBe(0);
    expect(summary.totalAdditions).toBe(0);
    expect(summary.totalDeletions).toBe(0);
  });
});

describe('filterDiffByPattern', () => {
  it('filters files by pattern', () => {
    const result = filterDiffByPattern(mockFiles, /\.ts$/);
    expect(result).toHaveLength(3);
    expect(result.every((f) => f.filename.endsWith('.ts'))).toBe(true);
  });

  it('returns empty array when no files match', () => {
    const result = filterDiffByPattern(mockFiles, /\.go$/);
    expect(result).toHaveLength(0);
  });

  it('filters test files', () => {
    const result = filterDiffByPattern(mockFiles, /test/);
    expect(result).toHaveLength(1);
    expect(result[0].filename).toBe('test/index.test.ts');
  });
});
