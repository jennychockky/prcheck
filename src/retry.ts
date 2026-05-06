import * as core from '@actions/core';

export interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier?: number;
  retryableErrors?: RegExp[];
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  delayMs: 500,
  backoffMultiplier: 2,
  retryableErrors: [/rate limit/i, /ECONNRESET/i, /socket hang up/i, /timeout/i],
};

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isRetryableError(error: unknown, patterns: RegExp[]): boolean {
  if (!error) return false;
  const message = error instanceof Error ? error.message : String(error);
  return patterns.some((pattern) => pattern.test(message));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts: RetryOptions = { ...DEFAULT_OPTIONS, ...options };
  const retryableErrors = opts.retryableErrors ?? DEFAULT_OPTIONS.retryableErrors!;
  let lastError: unknown;
  let delay = opts.delayMs;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const retryable = isRetryableError(err, retryableErrors);

      if (!retryable || attempt === opts.maxAttempts) {
        throw err;
      }

      core.warning(
        `Attempt ${attempt}/${opts.maxAttempts} failed: ${
          err instanceof Error ? err.message : String(err)
        }. Retrying in ${delay}ms...`
      );

      await sleep(delay);
      delay = Math.floor(delay * (opts.backoffMultiplier ?? 1));
    }
  }

  throw lastError;
}
