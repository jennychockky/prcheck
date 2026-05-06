import {
  setCacheEntry,
  getCacheEntry,
  invalidateCache,
  clearCache,
  getCacheStats,
} from './cache';

jest.mock('@actions/core', () => ({
  debug: jest.fn(),
}));

describe('cache', () => {
  beforeEach(() => {
    clearCache();
  });

  describe('setCacheEntry / getCacheEntry', () => {
    it('stores and retrieves a value', () => {
      setCacheEntry('key1', { data: 'hello' });
      expect(getCacheEntry('key1')).toEqual({ data: 'hello' });
    });

    it('returns null for unknown key', () => {
      expect(getCacheEntry('missing')).toBeNull();
    });

    it('returns null for expired entry', () => {
      jest.useFakeTimers();
      setCacheEntry('expiring', 'value', 100);
      jest.advanceTimersByTime(200);
      expect(getCacheEntry('expiring')).toBeNull();
      jest.useRealTimers();
    });

    it('returns value within TTL', () => {
      jest.useFakeTimers();
      setCacheEntry('fresh', 'value', 5000);
      jest.advanceTimersByTime(1000);
      expect(getCacheEntry('fresh')).toBe('value');
      jest.useRealTimers();
    });
  });

  describe('invalidateCache', () => {
    it('removes a specific key', () => {
      setCacheEntry('toRemove', 42);
      invalidateCache('toRemove');
      expect(getCacheEntry('toRemove')).toBeNull();
    });

    it('does not affect other keys', () => {
      setCacheEntry('keep', 'yes');
      setCacheEntry('remove', 'no');
      invalidateCache('remove');
      expect(getCacheEntry('keep')).toBe('yes');
    });
  });

  describe('getCacheStats', () => {
    it('returns correct size and keys', () => {
      setCacheEntry('a', 1);
      setCacheEntry('b', 2);
      const stats = getCacheStats();
      expect(stats.size).toBe(2);
      expect(stats.keys).toContain('a');
      expect(stats.keys).toContain('b');
    });
  });
});
