/**
 * Server-side API response caching to minimize Contentful API calls
 * Uses Map-based caching with request-scoped lifetime
 */

// Request-scoped cache - cleared between requests
const apiCache = new Map<string, any>();

/**
 * Generate cache key from query and variables
 */
function getCacheKey(query: string, variables: Record<string, unknown>, preview: boolean): string {
  return `${query}-${JSON.stringify(variables)}-${preview}`;
}

/**
 * Memoized wrapper for fetchGraphQL to prevent duplicate API calls
 */
export async function memoizedFetchGraphQL<T>(
  fetchGraphQL: (query: string, variables: Record<string, unknown>, preview: boolean) => Promise<T>,
  query: string,
  variables: Record<string, unknown> = {},
  preview = false
): Promise<T> {
  const cacheKey = getCacheKey(query, variables, preview);
  
  // Return cached result if available
  if (apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey);
  }
  
  // Fetch and cache the result
  const result = await fetchGraphQL(query, variables, preview);
  apiCache.set(cacheKey, result);
  
  return result;
}

/**
 * Clear the API cache (called at the start of each request)
 */
export function clearApiCache(): void {
  apiCache.clear();
}

/**
 * Get cache statistics
 */
export function getApiCacheStats(): { size: number; keys: string[] } {
  return {
    size: apiCache.size,
    keys: Array.from(apiCache.keys()).map(key => key.substring(0, 100) + '...')
  };
}
