# Cache Module

The `cache` module provides a lightweight in-memory TTL cache used across `prcheck` to avoid redundant API calls and file reads within a single action run.

## API

### `setCacheEntry<T>(key: string, value: T, ttlMs?: number): void`

Stores a value under `key` with an optional time-to-live in milliseconds (default: `60000` ms / 1 minute).

### `getCacheEntry<T>(key: string): T | null`

Retrieves a cached value by key. Returns `null` if the key does not exist or the entry has expired. Expired entries are automatically evicted on access.

### `invalidateCache(key: string): void`

Removes a specific entry from the cache immediately.

### `clearCache(): void`

Clears all entries from the cache. Primarily used in tests to reset state between runs.

### `getCacheStats(): { size: number; keys: string[] }`

Returns diagnostic information about the current cache state.

## Usage Example

```typescript
import { setCacheEntry, getCacheEntry } from './cache';

const cacheKey = `labels:${owner}/${repo}#${prNumber}`;
let labels = getCacheEntry<string[]>(cacheKey);

if (!labels) {
  labels = await fetchLabelsFromAPI(owner, repo, prNumber);
  setCacheEntry(cacheKey, labels, 30000); // cache for 30 seconds
}
```

## Notes

- The cache is **in-memory only** and does not persist between action runs.
- TTL expiry is checked lazily on `getCacheEntry` — no background cleanup timer is used.
