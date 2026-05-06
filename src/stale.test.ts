import { checkStalePR, getDaysSinceUpdate } from './stale';

function daysAgo(days: number): string {
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return d.toISOString();
}

describe('getDaysSinceUpdate', () => {
  it('returns 0 for a timestamp from today', () => {
    const result = getDaysSinceUpdate(new Date().toISOString());
    expect(result).toBe(0);
  });

  it('returns correct number of days for a past date', () => {
    const result = getDaysSinceUpdate(daysAgo(5));
    expect(result).toBe(5);
  });
});

describe('checkStalePR', () => {
  const config = { maxDaysWithoutUpdate: 14, warnDaysWithoutUpdate: 10 };

  it('marks PR as stale when days exceed maxDaysWithoutUpdate', () => {
    const result = checkStalePR(daysAgo(15), config);
    expect(result.isStale).toBe(true);
    expect(result.isWarning).toBe(false);
    expect(result.message).toContain('exceeding the limit');
  });

  it('marks PR as warning when days are between warn and max thresholds', () => {
    const result = checkStalePR(daysAgo(11), config);
    expect(result.isStale).toBe(false);
    expect(result.isWarning).toBe(true);
    expect(result.message).toContain('Consider updating soon');
  });

  it('returns healthy result when PR is recently updated', () => {
    const result = checkStalePR(daysAgo(3), config);
    expect(result.isStale).toBe(false);
    expect(result.isWarning).toBe(false);
    expect(result.message).toContain('Within acceptable range');
  });

  it('uses maxDaysWithoutUpdate as warn threshold when warnDaysWithoutUpdate is not set', () => {
    const cfg = { maxDaysWithoutUpdate: 7 };
    const result = checkStalePR(daysAgo(6), cfg);
    expect(result.isWarning).toBe(false);
    expect(result.isStale).toBe(false);
  });

  it('marks stale exactly at the max threshold', () => {
    const result = checkStalePR(daysAgo(14), config);
    expect(result.isStale).toBe(true);
  });

  it('includes daysSinceUpdate and lastUpdatedAt in result', () => {
    const updatedAt = daysAgo(4);
    const result = checkStalePR(updatedAt, config);
    expect(result.daysSinceUpdate).toBe(4);
    expect(result.lastUpdatedAt).toBe(updatedAt);
  });
});
