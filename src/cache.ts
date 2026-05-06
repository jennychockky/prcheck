import * as fs from 'fs';
import * as path from 'path';
import * as core from '@actions/core';

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

export function setCacheEntry<T>(key: string, value: T, ttlMs = 60000): void {
  memoryCache.set(key, {
    value,
    timestamp: Date.now(),
    ttl: ttlMs,
  });
}

export function getCacheEntry<T>(key: string): T | null {
  const entry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (age > entry.ttl) {
    memoryCache.delete(key);
    core.debug(`Cache miss (expired) for key: ${key}`);
    return null;
  }

  core.debug(`Cache hit for key: ${key}`);
  return entry.value;
}

export function invalidateCache(key: string): void {
  memoryCache.delete(key);
}

export function clearCache(): void {
  memoryCache.clear();
}

export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: memoryCache.size,
    keys: Array.from(memoryCache.keys()),
  };
}
