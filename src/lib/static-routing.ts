/**
 * Static Routing Service
 *
 * Fast routing resolution using pre-generated sitemap cache.
 * This service checks the static routing cache first before falling back to dynamic content fetching.
 */

import routingCacheData from './routing-cache.json';

interface RouteMetadata {
  path: string;
  contentType: 'Page' | 'Product' | 'Service' | 'Solution' | 'Post' | 'PageList';
  contentId: string;
  title: string;
  parentPageLists: Array<{
    id: string;
    slug: string;
    title: string;
  }>;
  isNested: boolean;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

interface RoutingCache {
  routes: Record<string, RouteMetadata>;
  generatedAt: string;
  version: string;
}

class StaticRoutingService {
  private cache: RoutingCache;
  private initialized = false;

  constructor() {
    this.cache = routingCacheData as RoutingCache;
    this.initialized = true;
  }

  /**
   * Check if the routing cache is available and valid
   */
  isAvailable(): boolean {
    return this.initialized && this.cache && Object.keys(this.cache.routes).length > 0;
  }

  /**
   * Get route metadata for a given path
   * @param path - The URL path to look up (e.g., '/products/trackers')
   * @returns Route metadata if found, null otherwise
   */
  getRoute(path: string): RouteMetadata | null {
    if (!this.isAvailable()) {
      return null;
    }

    // Normalize path - ensure it starts with / and doesn't end with /
    const normalizedPath = path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}`;

    // Use secure property access without suppressions
    const route = Object.prototype.hasOwnProperty.call(this.cache.routes, normalizedPath)
      ? (Object.getOwnPropertyDescriptor(this.cache.routes, normalizedPath)?.value as
          | RouteMetadata
          | undefined)
      : undefined;

    if (route) {
      return route;
    }

    return null;
  }

  /**
   * Get route metadata for URL segments
   * @param segments - Array of URL segments (e.g., ['products', 'trackers'])
   * @returns Route metadata if found, null otherwise
   */
  getRouteBySegments(segments: string[]): RouteMetadata | null {
    if (!segments || segments.length === 0) {
      return this.getRoute('/');
    }

    const path = `/${segments.join('/')}`;
    return this.getRoute(path);
  }

  /**
   * Check if a route exists in the static cache
   * @param path - The URL path to check
   * @returns True if route exists, false otherwise
   */
  hasRoute(path: string): boolean {
    return this.getRoute(path) !== null;
  }

  /**
   * Get all routes of a specific content type
   * @param contentType - The content type to filter by
   * @returns Array of route metadata for the specified content type
   */
  getRoutesByContentType(contentType: RouteMetadata['contentType']): RouteMetadata[] {
    if (!this.isAvailable()) {
      return [];
    }

    return Object.values(this.cache.routes).filter((route) => route.contentType === contentType);
  }

  /**
   * Get all nested routes (routes with parent PageLists)
   * @returns Array of nested route metadata
   */
  getNestedRoutes(): RouteMetadata[] {
    if (!this.isAvailable()) {
      return [];
    }

    return Object.values(this.cache.routes).filter((route) => route.isNested);
  }

  /**
   * Get all routes under a specific parent PageList
   * @param pageListSlug - The slug of the parent PageList
   * @returns Array of route metadata under the specified PageList
   */
  getRoutesUnderPageList(pageListSlug: string): RouteMetadata[] {
    if (!this.isAvailable()) {
      return [];
    }

    return Object.values(this.cache.routes).filter((route) =>
      route.parentPageLists.some((parent) => parent.slug === pageListSlug)
    );
  }

  /**
   * Search routes by title (case-insensitive)
   * @param query - Search query
   * @returns Array of matching route metadata
   */
  searchRoutes(query: string): RouteMetadata[] {
    if (!this.isAvailable() || !query.trim()) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    return Object.values(this.cache.routes).filter(
      (route) =>
        route.title.toLowerCase().includes(lowerQuery) ||
        route.path.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get cache statistics
   * @returns Object with cache statistics
   */
  getStats() {
    if (!this.isAvailable()) {
      return {
        totalRoutes: 0,
        contentTypes: {},
        nestedRoutes: 0,
        generatedAt: null,
        version: null
      };
    }

    const routes = Object.values(this.cache.routes);
    const contentTypes = routes.reduce(
      (acc, route) => {
        acc[route.contentType] = (acc[route.contentType] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalRoutes: routes.length,
      contentTypes,
      nestedRoutes: routes.filter((r) => r.isNested).length,
      generatedAt: this.cache.generatedAt ?? null,
      version: this.cache.version
    };
  }

  /**
   * Get all available paths (for debugging)
   * @returns Array of all available paths
   */
  getAllPaths(): string[] {
    if (!this.isAvailable()) {
      return [];
    }

    return Object.keys(this.cache.routes).sort();
  }

  /**
   * Validate a route path format
   * @param path - The path to validate
   * @returns True if path format is valid
   */
  isValidPath(path: string): boolean {
    // Basic path validation
    if (!path || typeof path !== 'string') return false;
    if (!path.startsWith('/')) return false;
    if (path.includes('//')) return false;
    if (path.includes('undefined')) return false;
    return true;
  }
}

// Create singleton instance
const staticRoutingService = new StaticRoutingService();

// Export both the service instance and the class for testing
export { StaticRoutingService, staticRoutingService };
export type { RouteMetadata, RoutingCache };
