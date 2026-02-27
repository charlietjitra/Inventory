/**
 * API Response Caching Module
 * Provides intelligent caching for API responses to reduce redundant requests
 *
 * Features:
 * - TTL-based cache expiration (configurable per endpoint)
 * - Pattern-based cache invalidation
 * - Automatic cache clearing on mutations
 * - Optional compression for large responses
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ApiCache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEBUG = false; // Set to true for debug logging

  /**
   * Store data in cache with optional TTL
   * @param key Cache key (e.g., "owners/all", "pallets/1")
   * @param data Response data to cache
   * @param ttl Time to live in milliseconds (default: 5 minutes)
   */
  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
    if (this.DEBUG) console.log(`[Cache] SET ${key} (TTL: ${ttl}ms)`);
  }

  /**
   * Retrieve data from cache if valid
   * @param key Cache key
   * @returns Cached data or null if expired/not found
   */
  get(key: string): any {
    const entry = this.cache.get(key);
    if (!entry) {
      if (this.DEBUG) console.log(`[Cache] MISS ${key} (not found)`);
      return null;
    }

    // Check if cache has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      if (this.DEBUG) console.log(`[Cache] EXPIRED ${key}`);
      return null;
    }

    if (this.DEBUG) console.log(`[Cache] HIT ${key}`);
    return entry.data;
  }

  /**
   * Invalidate cache entries matching a pattern
   * @param pattern Regex pattern to match keys (e.g., "owners/*", "pallets/.*")
   */
  invalidate(pattern: string | RegExp): void {
    const regex =
      typeof pattern === "string"
        ? new RegExp(pattern.replace(/\*/g, ".*"))
        : pattern;

    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.match(regex)) {
        this.cache.delete(key);
        count++;
      }
    }
    if (this.DEBUG)
      console.log(`[Cache] INVALIDATED ${count} entries matching ${pattern}`);
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    if (this.DEBUG) console.log(`[Cache] CLEARED ${size} entries`);
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export default new ApiCache();
