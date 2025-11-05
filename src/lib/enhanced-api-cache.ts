/**
 * Enhanced Server-side API response caching with memory management
 * Features: TTL, size limits, LRU eviction, memory monitoring
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheConfig {
  maxSize: number;
  ttlMs: number;
  maxMemoryMB: number;
  cleanupIntervalMs: number;
}

class EnhancedApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;
  private memoryCheckTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize ?? 1000, // Max 1000 entries
      ttlMs: config.ttlMs ?? 5 * 60 * 1000, // 5 minutes TTL
      maxMemoryMB: config.maxMemoryMB ?? 100, // 100MB memory limit
      cleanupIntervalMs: config.cleanupIntervalMs ?? 60 * 1000, // Cleanup every minute
    };

    this.startCleanupTimer();
    this.startMemoryMonitoring();
  }

  /**
   * Get item from cache with TTL and access tracking
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    // Check TTL
    if (Date.now() - entry.timestamp > this.config.ttlMs) {
      this.cache.delete(key);
      return undefined;
    }

    // Update access tracking for LRU
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    return entry.data;
  }

  /**
   * Set item in cache with automatic eviction
   */
  set<T>(key: string, data: T): void {
    // Check size limit and evict if necessary
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const memoryUsage = this.getMemoryUsage();
    const now = Date.now();
    
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      memoryUsageMB: memoryUsage,
      maxMemoryMB: this.config.maxMemoryMB,
      expiredEntries: Array.from(this.cache.entries()).filter(
        ([, entry]) => now - entry.timestamp > this.config.ttlMs
      ).length,
      oldestEntry: Math.min(...Array.from(this.cache.values()).map(e => e.timestamp)),
      newestEntry: Math.max(...Array.from(this.cache.values()).map(e => e.timestamp)),
    };
  }

  /**
   * Evict least recently used entries
   */
  private evictLeastRecentlyUsed(): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by last accessed time (oldest first)
    entries.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
    
    // Remove oldest 20% of entries
    const toRemove = Math.ceil(entries.length * 0.2);
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      const entry = entries[i];
      if (entry) {
        this.cache.delete(entry[0]);
      }
    }
  }

  /**
   * Remove expired entries
   */
  private cleanupExpired(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.ttlMs) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log(`[Cache] Cleaned up ${expiredKeys.length} expired entries`);
    }
  }

  /**
   * Estimate memory usage of cache
   */
  private getMemoryUsage(): number {
    let totalSize = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      // Rough estimation: key size + JSON size of data
      totalSize += key.length * 2; // UTF-16 characters
      totalSize += JSON.stringify(entry.data).length * 2;
      totalSize += 64; // Overhead for entry metadata
    }
    
    return totalSize / (1024 * 1024); // Convert to MB
  }

  /**
   * Start periodic cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired();
    }, this.config.cleanupIntervalMs);
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring(): void {
    this.memoryCheckTimer = setInterval(() => {
      const memoryUsage = this.getMemoryUsage();
      
      if (memoryUsage > this.config.maxMemoryMB) {
        console.warn(`[Cache] Memory usage ${memoryUsage.toFixed(2)}MB exceeds limit ${this.config.maxMemoryMB}MB`);
        
        // Aggressive cleanup: remove 50% of entries
        const entries = Array.from(this.cache.entries());
        entries.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
        
        const toRemove = Math.ceil(entries.length * 0.5);
        for (let i = 0; i < toRemove && i < entries.length; i++) {
          const entry = entries[i];
          if (entry) {
            this.cache.delete(entry[0]);
          }
        }
        
        console.log(`[Cache] Emergency cleanup: removed ${toRemove} entries`);
      }
    }, this.config.cleanupIntervalMs);
  }

  /**
   * Cleanup timers on shutdown
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    if (this.memoryCheckTimer) {
      clearInterval(this.memoryCheckTimer);
    }
    this.clear();
  }
}

// Global cache instance
const enhancedApiCache = new EnhancedApiCache({
  maxSize: process.env.NODE_ENV === 'production' ? 2000 : 500,
  ttlMs: 10 * 60 * 1000, // 10 minutes in production
  maxMemoryMB: process.env.NODE_ENV === 'production' ? 200 : 50,
});

/**
 * Generate cache key from query and variables
 */
function getCacheKey(query: string, variables: Record<string, unknown>, preview: boolean): string {
  // Create a shorter, more efficient cache key
  const queryHash = hashString(query);
  const varsHash = hashString(JSON.stringify(variables));
  return `${queryHash}-${varsHash}-${preview}`;
}

/**
 * Simple string hash function for cache keys
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Enhanced memoized wrapper for fetchGraphQL
 */
export async function enhancedMemoizedFetchGraphQL<T>(
  fetchGraphQL: (query: string, variables: Record<string, unknown>, preview: boolean) => Promise<T>,
  query: string,
  variables: Record<string, unknown> = {},
  preview = false
): Promise<T> {
  const cacheKey = getCacheKey(query, variables, preview);
  
  // Try to get from cache
  const cached = enhancedApiCache.get<T>(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  
  // Fetch and cache the result
  const result = await fetchGraphQL(query, variables, preview);
  enhancedApiCache.set(cacheKey, result);
  
  return result;
}

/**
 * Clear the API cache
 */
export function clearEnhancedApiCache(): void {
  enhancedApiCache.clear();
}

/**
 * Get enhanced cache statistics
 */
export function getEnhancedApiCacheStats() {
  return enhancedApiCache.getStats();
}

/**
 * Cleanup cache resources
 */
export function destroyEnhancedApiCache(): void {
  enhancedApiCache.destroy();
}

// Cleanup on process exit
process.on('SIGTERM', destroyEnhancedApiCache);
process.on('SIGINT', destroyEnhancedApiCache);
