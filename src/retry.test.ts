import { withRetry, isRetryableError, sleep } from './retry';

jest.mock('@actions/core', () => ({ warning: jest.fn() }));

describe('sleep', () => {
  it('resolves after the given delay', async () => {
    const start = Date.now();
    await sleep(50);
    expect(Date.now() - start).toBeGreaterThanOrEqual(40);
  });
});

describe('isRetryableError', () => {
  const patterns = [/rate limit/i, /timeout/i];

  it('returns true when error message matches a pattern', () => {
    expect(isRetryableError(new Error('GitHub rate limit exceeded'), patterns)).toBe(true);
    expect(isRetryableError(new Error('Request timeout'), patterns)).toBe(true);
  });

  it('returns false when error message does not match any pattern', () => {
    expect(isRetryableError(new Error('Not found'), patterns)).toBe(false);
  });

  it('returns false for falsy error', () => {
    expect(isRetryableError(null, patterns)).toBe(false);
    expect(isRetryableError(undefined, patterns)).toBe(false);
  });

  it('handles non-Error objects', () => {
    expect(isRetryableError('rate limit hit', patterns)).toBe(true);
    expect(isRetryableError('some other string', patterns)).toBe(false);
  });
});

describe('withRetry', () => {
  it('returns the result on first success', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await withRetry(fn, { maxAttempts: 3, delayMs: 0 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable errors and eventually succeeds', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('rate limit exceeded'))
      .mockResolvedValue('success');

    const result = await withRetry(fn, { maxAttempts: 3, delayMs: 0 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws immediately on non-retryable errors', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('Validation failed'));
    await expect(withRetry(fn, { maxAttempts: 3, delayMs: 0 })).rejects.toThrow('Validation failed');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('exhausts all attempts and throws the last error', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('timeout'));
    await expect(withRetry(fn, { maxAttempts: 3, delayMs: 0 })).rejects.toThrow('timeout');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('respects custom retryable error patterns', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('custom transient error'));
    await expect(
      withRetry(fn, { maxAttempts: 2, delayMs: 0, retryableErrors: [/custom transient/i] })
    ).rejects.toThrow('custom transient error');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
