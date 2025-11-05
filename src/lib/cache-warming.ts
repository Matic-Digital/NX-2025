/**
 * Cache warming strategies to preload frequently accessed content
 */

import { fetchGraphQLMemoized } from '@/lib/api';

interface WarmupConfig {
  enabled: boolean;
  intervalMs: number;
  maxConcurrent: number;
}

/**
 * Common queries that should be warmed up
 */
const WARMUP_QUERIES = [
  // Navigation and global content
  {
    query: `query GetGlobalNavigation {
      navigationCollection(limit: 1) {
        items {
          sys { id }
          title
          navigationItemsCollection {
            items {
              sys { id }
              title
              slug
            }
          }
        }
      }
    }`,
    variables: {},
    priority: 1,
  },
  
  // Homepage content
  {
    query: `query GetHomePage {
      pageCollection(where: { slug: "home" }, limit: 1) {
        items {
          sys { id }
          title
          slug
          pageContentCollection {
            items {
              sys { id }
              __typename
            }
          }
        }
      }
    }`,
    variables: {},
    priority: 1,
  },
  
  // Recent blog posts
  {
    query: `query GetRecentPosts {
      postCollection(limit: 10, order: sys_publishedAt_DESC) {
        items {
          sys { id }
          title
          slug
          excerpt
          publishedAt
        }
      }
    }`,
    variables: {},
    priority: 2,
  },
];

class CacheWarmer {
  private config: WarmupConfig;
  private warmupTimer?: NodeJS.Timeout;
  private isWarming = false;

  constructor(config: Partial<WarmupConfig> = {}) {
    this.config = {
      enabled: config.enabled ?? process.env.NODE_ENV === 'production',
      intervalMs: config.intervalMs ?? 15 * 60 * 1000, // 15 minutes
      maxConcurrent: config.maxConcurrent ?? 3,
    };

    if (this.config.enabled) {
      this.startWarmupTimer();
    }
  }

  /**
   * Warm up cache with common queries
   */
  async warmupCache(): Promise<void> {
    if (this.isWarming) {
      console.warn('[Cache Warmer] Already warming up, skipping...');
      return;
    }

    this.isWarming = true;
    console.warn('[Cache Warmer] Starting cache warmup...');

    try {
      // Sort queries by priority
      const sortedQueries = [...WARMUP_QUERIES].sort((a, b) => a.priority - b.priority);
      
      // Process queries in batches to avoid overwhelming the server
      for (let i = 0; i < sortedQueries.length; i += this.config.maxConcurrent) {
        const batch = sortedQueries.slice(i, i + this.config.maxConcurrent);
        
        await Promise.allSettled(
          batch.map(async ({ query, variables }) => {
            try {
              await fetchGraphQLMemoized(query, variables, false);
              console.warn(`[Cache Warmer] Warmed up query: ${query.split('{')[0]?.trim() ?? 'unknown'}`);
            } catch (error) {
              console.warn(`[Cache Warmer] Failed to warm up query:`, error);
            }
          })
        );

        // Small delay between batches
        if (i + this.config.maxConcurrent < sortedQueries.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.warn('[Cache Warmer] Cache warmup completed');
    } catch (error) {
      console.error('[Cache Warmer] Cache warmup failed:', error);
    } finally {
      this.isWarming = false;
    }
  }

  /**
   * Start periodic cache warming
   */
  private startWarmupTimer(): void {
    // Initial warmup after 30 seconds
    setTimeout(() => {
      this.warmupCache();
    }, 30 * 1000);

    // Periodic warmup
    this.warmupTimer = setInterval(() => {
      this.warmupCache();
    }, this.config.intervalMs);
  }

  /**
   * Stop cache warming
   */
  stop(): void {
    if (this.warmupTimer) {
      clearInterval(this.warmupTimer);
      this.warmupTimer = undefined;
    }
  }
}

// Global cache warmer instance
const cacheWarmer = new CacheWarmer();

/**
 * Manually trigger cache warmup
 */
export async function warmupCache(): Promise<void> {
  return cacheWarmer.warmupCache();
}

/**
 * Stop cache warming
 */
export function stopCacheWarming(): void {
  cacheWarmer.stop();
}

// Cleanup on process exit
process.on('SIGTERM', stopCacheWarming);
process.on('SIGINT', stopCacheWarming);
