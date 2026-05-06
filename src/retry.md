# retry

Provides a generic `withRetry` utility for wrapping async operations that may
fail transiently (e.g. GitHub API rate-limits, network resets).

## API

### `withRetry<T>(fn, options?): Promise<T>`

Executes `fn` and retries up to `maxAttempts` times when a retryable error is
detected. Applies exponential back-off between attempts.

| Option | Default | Description |
|---|---|---|
| `maxAttempts` | `3` | Total number of attempts (including the first). |
| `delayMs` | `500` | Initial delay between attempts in milliseconds. |
| `backoffMultiplier` | `2` | Multiplier applied to the delay after each failure. |
| `retryableErrors` | see below | Array of `RegExp` patterns matched against `error.message`. |

Default retryable patterns: `rate limit`, `ECONNRESET`, `socket hang up`, `timeout`.

### `isRetryableError(error, patterns): boolean`

Returns `true` when `error.message` (or `String(error)`) matches at least one
pattern in the provided array.

### `sleep(ms): Promise<void>`

Simple promise-based delay helper.

## Usage

```ts
import { withRetry } from './retry';

const data = await withRetry(() => octokit.pulls.get({ owner, repo, pull_number }), {
  maxAttempts: 5,
  delayMs: 1000,
});
```

Non-retryable errors are re-thrown immediately without consuming extra attempts.
