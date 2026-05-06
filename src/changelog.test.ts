import { parseChangelog, getLatestEntry, hasUnreleasedChanges } from './changelog';

const sampleChangelog = `
## [Unreleased]
### Added
- New feature X
- Support for Y

## [1.2.0] - 2024-03-15
### Added
- Feature A
### Fixed
- Bug B
- Bug C

## [1.1.0] - 2024-01-10
### Changed
- Updated dependency Z
`;

describe('parseChangelog', () => {
  it('parses multiple version entries', () => {
    const entries = parseChangelog(sampleChangelog);
    expect(entries).toHaveLength(3);
  });

  it('extracts version and date correctly', () => {
    const entries = parseChangelog(sampleChangelog);
    expect(entries[1].version).toBe('1.2.0');
    expect(entries[1].date).toBe('2024-03-15');
  });

  it('marks unreleased entry with no date as Unreleased', () => {
    const entries = parseChangelog(sampleChangelog);
    expect(entries[0].version).toBe('Unreleased');
    expect(entries[0].date).toBe('Unreleased');
  });

  it('parses sections and items correctly', () => {
    const entries = parseChangelog(sampleChangelog);
    expect(entries[1].sections['Added']).toEqual(['Feature A']);
    expect(entries[1].sections['Fixed']).toEqual(['Bug B', 'Bug C']);
  });

  it('returns empty array for empty input', () => {
    expect(parseChangelog('')).toEqual([]);
  });
});

describe('getLatestEntry', () => {
  it('returns first entry', () => {
    const entries = parseChangelog(sampleChangelog);
    const latest = getLatestEntry(entries);
    expect(latest?.version).toBe('Unreleased');
  });

  it('returns null for empty entries', () => {
    expect(getLatestEntry([])).toBeNull();
  });
});

describe('hasUnreleasedChanges', () => {
  it('returns true when unreleased section exists', () => {
    const entries = parseChangelog(sampleChangelog);
    expect(hasUnreleasedChanges(entries)).toBe(true);
  });

  it('returns false when no unreleased section', () => {
    const entries = parseChangelog('## [1.0.0] - 2024-01-01\n### Added\n- Initial release\n');
    expect(hasUnreleasedChanges(entries)).toBe(false);
  });
});
