import NodeCache from "node-cache";

const cache = new NodeCache();

export type SetCacheT<T> = {
  key: string;
  value: T;
  ttl?: number;
};

/**
 * Set a value in cache
 * @param key Cache key
 * @param value Value to cache
 * @param ttl Time to live in seconds (optional)
 */
export function setCache<T>({ key, value, ttl }: SetCacheT<T>): boolean {
  if (ttl !== undefined) {
    return cache.set(key, value, ttl);
  }
  return cache.set(key, value);
}

/**
 * Get a value from cache
 * @param key Cache key
 */
export function getCache<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

/**
 * Delete a value from cache
 * @param key Cache key
 */
export function delCache(key: string): number {
  return cache.del(key);
}

/**
 * Flush all cache
 */
export function flushCache(): void {
  cache.flushAll();
}
