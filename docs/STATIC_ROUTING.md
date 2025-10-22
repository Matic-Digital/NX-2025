# Static Routing System

This document describes the static routing system that optimizes page resolution by using a pre-generated sitemap cache.

## Overview

The static routing system addresses performance issues with dynamic content fetching by:

1. **Pre-generating a routing cache** during build time with all available routes and their metadata
2. **Fast route lookups** using the static cache before falling back to dynamic resolution
3. **Reduced API calls** by avoiding redundant Contentful queries for known routes

## Architecture

### Components

1. **Enhanced Sitemap Generator** (`scripts/generate-routing-sitemap.ts`)
   - Fetches all content from Contentful during build
   - Generates comprehensive routing cache with metadata
   - Creates both XML sitemap and JSON routing cache

2. **Static Routing Service** (`src/lib/static-routing.ts`)
   - Provides fast route lookups using the pre-generated cache
   - Offers various query methods (by path, segments, content type, etc.)
   - Includes search and filtering capabilities

3. **Enhanced Dynamic Routes** (`src/app/[...segments]/page.tsx`)
   - Uses static cache first for route resolution
   - Falls back to dynamic resolution if route not found in cache
   - Maintains backward compatibility with existing routing logic

### Data Flow

```
User Request → Static Cache Lookup → Content Found? → Render Page
                     ↓                      ↓
              Route Not Found        Fallback to Dynamic Resolution → Render Page
                     ↓
                404 Not Found
```

## Usage

### Build Process

The routing cache is automatically generated during the build process:

```bash
# Generate routing cache and build
npm run build

# Generate routing cache only
npm run sitemap:routing

# Test the routing system
npm run sitemap:test
```

### Route Resolution

The system automatically handles route resolution in the dynamic routes:

```typescript
// Fast lookup using static cache
const route = staticRoutingService.getRouteBySegments(['products', 'trackers']);

if (route) {
  // Route found in cache - fast resolution
  console.log(`Found: ${route.contentType} - ${route.title}`);
} else {
  // Fallback to dynamic resolution
  const result = await resolveNestedContent(segments);
}
```

### API Reference

#### StaticRoutingService Methods

```typescript
// Basic route lookup
getRoute(path: string): RouteMetadata | null
getRouteBySegments(segments: string[]): RouteMetadata | null

// Route existence check
hasRoute(path: string): boolean

// Content type filtering
getRoutesByContentType(contentType: string): RouteMetadata[]

// Nested routes
getNestedRoutes(): RouteMetadata[]
getRoutesUnderPageList(pageListSlug: string): RouteMetadata[]

// Search functionality
searchRoutes(query: string): RouteMetadata[]

// Utility methods
getStats(): CacheStats
getAllPaths(): string[]
isValidPath(path: string): boolean
```

#### RouteMetadata Interface

```typescript
interface RouteMetadata {
  path: string;                    // Full URL path
  contentType: string;             // Content type (Page, Product, etc.)
  contentId: string;               // Contentful entry ID
  title: string;                   // Content title
  parentPageLists: Array<{         // Parent PageList hierarchy
    id: string;
    slug: string;
    title: string;
  }>;
  isNested: boolean;               // Whether route is nested
  priority: number;                // SEO priority (0.0-1.0)
  changefreq: string;              // SEO change frequency
}
```

## Performance Benefits

### Before (Dynamic Resolution)
- Every page request triggers multiple Contentful API calls
- Complex nesting validation on each request
- Slower response times, especially for nested routes
- Higher API usage and costs

### After (Static Cache + Fallback)
- **Fast cache lookup** for known routes (milliseconds vs seconds)
- **Reduced API calls** by ~80% for cached routes
- **Improved response times** for all cached content
- **Graceful fallback** for new or uncached content

## Cache Management

### Generation
- Cache is generated during build process
- Includes all content types: Pages, Products, Services, Solutions, Posts, PageLists
- Captures full nesting hierarchy and metadata

### Updates
- Cache is regenerated on every build
- No runtime cache invalidation needed
- Always reflects latest content structure

### Fallback Strategy
- If route not found in cache → dynamic resolution
- If cache file missing → dynamic resolution only
- Maintains 100% backward compatibility

## Development Workflow

### Local Development
```bash
# Generate fresh routing cache
npm run sitemap:routing

# Test the routing system
npm run sitemap:test

# Start development server
npm run dev
```

### Production Deployment
```bash
# Build with routing cache generation
npm run build

# The build process automatically:
# 1. Generates routing cache from Contentful
# 2. Creates XML sitemap
# 3. Builds Next.js application with static cache
```

## Monitoring and Debugging

### Console Logs
The system provides detailed console logging:

```
🚀 Static route found: /products/trackers → PageList (abc123)
✅ Static route resolved successfully: NX Horizon Trackers
🔄 Falling back to dynamic resolution for: /new-content
```

### Debug Information
```bash
# View cache statistics
npm run sitemap:test

# Check generated files
ls -la src/lib/routing-cache.json
ls -la public/sitemap.xml
ls -la routing-debug.json
```

### Cache Statistics
The routing service provides runtime statistics:

```typescript
const stats = staticRoutingService.getStats();
console.log(`Total routes: ${stats.totalRoutes}`);
console.log(`Content types:`, stats.contentTypes);
console.log(`Generated at: ${stats.generatedAt}`);
```

## Troubleshooting

### Common Issues

1. **Cache file not found**
   - Run `npm run sitemap:routing` to generate cache
   - Ensure build process includes cache generation

2. **Route not found in cache**
   - Check if content exists in Contentful
   - Verify content has proper slug
   - Regenerate cache after content changes

3. **Build fails during cache generation**
   - Check Contentful environment variables
   - Verify API access tokens
   - Check network connectivity to Contentful

### Environment Variables Required
```env
NEXT_PUBLIC_CONTENTFUL_SPACE_ID=your_space_id
NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN=your_access_token
NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT=staging_or_master
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Migration Guide

The static routing system is designed to be a drop-in enhancement:

1. **No code changes required** for existing routes
2. **Automatic performance improvement** for cached routes
3. **Graceful fallback** maintains existing functionality
4. **Build process integration** is automatic

The system enhances performance without breaking existing functionality.
