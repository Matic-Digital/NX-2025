#!/usr/bin/env tsx

/**
 * Enhanced sitemap generator with routing metadata
 * Generates both XML sitemap and routing lookup cache for fast page resolution
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Contentful configuration
const CONTENTFUL_SPACE_ID = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const CONTENTFUL_ACCESS_TOKEN = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;
const CONTENTFUL_ENVIRONMENT = process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || 'staging';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://nx-2025.vercel.app';

if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
  console.error('Missing required Contentful environment variables:');
  console.error('NEXT_PUBLIC_CONTENTFUL_SPACE_ID:', CONTENTFUL_SPACE_ID ? 'Set' : 'Missing');
  console.error('NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN:', CONTENTFUL_ACCESS_TOKEN ? 'Set' : 'Missing');
  process.exit(1);
}

// GraphQL endpoint
const GRAPHQL_ENDPOINT = `https://graphql.contentful.com/content/v1/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}`;

interface ContentfulItem {
  sys: { id: string };
  title: string;
  slug: string;
  __typename?: string;
}

interface ContentfulPageList {
  sys: { id: string };
  title?: string;
  slug?: string;
  __typename?: string;
  pagesCollection?: {
    items: Array<{
      __typename?: string;
      sys: { id: string };
      title: string;
      slug?: string;
      link?: string; // for ExternalPage
    }>;
  };
}

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

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

/**
 * Fetch data from Contentful GraphQL API
 */
async function fetchGraphQL<T>(
  query: string,
  variables: Record<string, any> = {}
): Promise<GraphQLResponse<T>> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CONTENTFUL_ACCESS_TOKEN}`
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `GraphQL request failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error(`GraphQL query failed: ${JSON.stringify(data.errors)}`);
    }

    return data;
  } catch (error) {
    console.error('Fetch error:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Get all standalone pages (not in any PageList)
 */
async function getStandalonePages(): Promise<ContentfulItem[]> {
  const query = `
    query GetStandalonePages {
      pageCollection(limit: 100) {
        items {
          sys { id }
          title
          slug
          __typename
        }
      }
    }
  `;

  const response = await fetchGraphQL<{ pageCollection: { items: ContentfulItem[] } }>(query);
  return response.data.pageCollection.items.filter((page) => page.slug);
}

/**
 * Get all PageLists and their nested pages
 */
async function getPageListsWithPages(): Promise<ContentfulPageList[]> {
  const query = `
    query GetPageListsWithPages {
      pageListCollection(limit: 100) {
        items {
          sys { id }
          title
          slug
          __typename
          pagesCollection(limit: 100) {
            items {
              __typename
              ... on Page {
                sys { id }
                title
                slug
              }
              ... on ExternalPage {
                sys { id }
                title
                link
              }
              ... on Product {
                sys { id }
                title
                slug
              }
              ... on Service {
                sys { id }
                title
                slug
              }
              ... on Solution {
                sys { id }
                title
                slug
              }
              ... on Post {
                sys { id }
                title
                slug
              }
              ... on PageList {
                sys { id }
                title
                slug
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetchGraphQL<{ pageListCollection: { items: ContentfulPageList[] } }>(
    query
  );
  return response.data.pageListCollection.items;
}

/**
 * Get all standalone content items (not in any PageList)
 */
async function getStandaloneContentItems(): Promise<{
  products: ContentfulItem[];
  solutions: ContentfulItem[];
  services: ContentfulItem[];
  posts: Array<ContentfulItem & { categories?: string | string[] }>;
}> {
  const queries = [
    {
      name: 'products',
      query: `query { productCollection(limit: 100) { items { sys { id } title slug __typename } } }`
    },
    {
      name: 'solutions',
      query: `query { solutionCollection(limit: 100) { items { sys { id } title slug __typename } } }`
    },
    {
      name: 'services',
      query: `query { serviceCollection(limit: 100) { items { sys { id } title slug __typename } } }`
    },
    {
      name: 'posts',
      query: `query { 
        postCollection(limit: 100) { 
          items { 
            sys { id } 
            title 
            slug 
            __typename
            categories
          } 
        } 
      }`
    }
  ];

  const results = await Promise.all(
    queries.map(async ({ name, query }) => {
      try {
        const response = await fetchGraphQL<Record<string, { items: ContentfulItem[] }>>(query);
        const collectionKey = `${name.slice(0, -1)}Collection`; // Remove 's' and add 'Collection'
        return {
          name,
          items: response.data[collectionKey]?.items?.filter((item) => item.slug) || []
        };
      } catch (error) {
        console.warn(`Failed to fetch ${name}:`, error);
        return { name, items: [] };
      }
    })
  );

  return {
    products: results.find(r => r.name === 'products')?.items || [],
    solutions: results.find(r => r.name === 'solutions')?.items || [],
    services: results.find(r => r.name === 'services')?.items || [],
    posts: results.find(r => r.name === 'posts')?.items || []
  };
}

/**
 * Build routing path by finding parent PageLists
 */
function buildRoutingPath(
  itemId: string, 
  pageLists: ContentfulPageList[], 
  visited = new Set<string>()
): Array<{ id: string; slug: string; title: string }> {
  if (visited.has(itemId)) return []; // Prevent infinite loops
  visited.add(itemId);

  for (const pageList of pageLists) {
    if (!pageList.pagesCollection?.items?.length) continue;

    const foundItem = pageList.pagesCollection.items.find((item) => item?.sys?.id === itemId);

    if (foundItem && pageList.slug) {
      const parentPath = buildRoutingPath(pageList.sys.id, pageLists, visited);
      return [...parentPath, { 
        id: pageList.sys.id, 
        slug: pageList.slug, 
        title: pageList.title || pageList.slug 
      }];
    }
  }
  return [];
}

/**
 * Check if an item is contained in any PageList
 */
function isItemInPageList(itemId: string, pageLists: ContentfulPageList[]): boolean {
  return pageLists.some(pageList => 
    pageList.pagesCollection?.items?.some(item => item?.sys?.id === itemId)
  );
}

/**
 * Generate routing cache with metadata from all content
 */
function generateRoutingCache(
  standalonePages: ContentfulItem[],
  pageLists: ContentfulPageList[],
  contentItems: {
    products: ContentfulItem[];
    solutions: ContentfulItem[];
    services: ContentfulItem[];
    posts: ContentfulItem[];
  }
): RoutingCache {
  const routes: Record<string, RouteMetadata> = {};

  // Add homepage
  routes['/'] = {
    path: '/',
    contentType: 'Page',
    contentId: 'homepage',
    title: 'Homepage',
    parentPageLists: [],
    isNested: false,
    priority: 1.0,
    changefreq: 'daily'
  };

  // Add standalone pages
  standalonePages.forEach((page) => {
    if (page.slug && page.slug.trim() && !isItemInPageList(page.sys.id, pageLists)) {
      const path = `/${page.slug}`;
      routes[path] = {
        path,
        contentType: 'Page',
        contentId: page.sys.id,
        title: page.title,
        parentPageLists: [],
        isNested: false,
        priority: 0.8,
        changefreq: 'weekly'
      };
    }
  });

  // Add standalone content items (excluding posts)
  const contentTypeConfig = [
    { items: contentItems.products, type: 'Product' as const, priority: 0.7, changefreq: 'monthly' as const },
    { items: contentItems.solutions, type: 'Solution' as const, priority: 0.7, changefreq: 'monthly' as const },
    { items: contentItems.services, type: 'Service' as const, priority: 0.6, changefreq: 'monthly' as const }
  ];

  contentTypeConfig.forEach(({ items, type, priority, changefreq }) => {
    items.forEach((item) => {
      if (item.slug && item.slug.trim() && !isItemInPageList(item.sys.id, pageLists)) {
        const path = `/${item.slug}`;
        routes[path] = {
          path,
          contentType: type,
          contentId: item.sys.id,
          title: item.title,
          parentPageLists: [],
          isNested: false,
          priority,
          changefreq
        };
      }
    });
  });

  // Handle posts with special /post/category/slug routing
  contentItems.posts.forEach((post) => {
    if (post.slug && post.slug.trim() && !isItemInPageList(post.sys.id, pageLists)) {
      // Extract category - use first category if multiple, or 'general' as fallback
      let category = 'general';
      const postWithCategories = post as ContentfulItem & { categories?: string | string[] };
      if (postWithCategories.categories) {
        if (Array.isArray(postWithCategories.categories)) {
          category = postWithCategories.categories[0] || 'general';
        } else if (typeof postWithCategories.categories === 'string') {
          category = postWithCategories.categories;
        }
      }
      
      // Clean category for URL (lowercase, replace spaces with hyphens)
      const cleanCategory = category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const path = `/post/${cleanCategory}/${post.slug}`;
      routes[path] = {
        path,
        contentType: 'Post',
        contentId: post.sys.id,
        title: post.title,
        parentPageLists: [],
        isNested: true, // Posts are considered nested under /post/category
        priority: 0.6,
        changefreq: 'weekly'
      };
    }
  });

  // Add PageList pages and their nested content
  pageLists.forEach((pageList) => {
    // Add PageList itself if it has a slug
    if (pageList.slug && pageList.slug.trim()) {
      const parentPath = buildRoutingPath(pageList.sys.id, pageLists);
      let fullPath = parentPath.length > 0 
        ? `/${[...parentPath.map(p => p.slug), pageList.slug].join('/')}`
        : `/${pageList.slug}`;

      // Clean up duplicate segments in the path
      const pathSegments = fullPath.split('/').filter(Boolean);
      const uniqueSegments = [];
      for (let i = 0; i < pathSegments.length; i++) {
        // Only add segment if it's not the same as the previous one
        if (i === 0 || pathSegments[i] !== pathSegments[i - 1]) {
          uniqueSegments.push(pathSegments[i]);
        }
      }
      fullPath = `/${uniqueSegments.join('/')}`;

      routes[fullPath] = {
        path: fullPath,
        contentType: 'PageList',
        contentId: pageList.sys.id,
        title: pageList.title || pageList.slug,
        parentPageLists: parentPath,
        isNested: parentPath.length > 0,
        priority: 0.8,
        changefreq: 'weekly'
      };
    }

    // Add pages within the PageList
    if (pageList.pagesCollection?.items) {
      pageList.pagesCollection.items.forEach((item) => {
        if (!item || item.__typename === 'ExternalPage') return;

        if (item.slug && item.slug.trim()) {
          let fullPath: string;
          
          // Check if the item's slug already contains the full nested path
          if (item.slug.includes('/')) {
            // Item slug already contains nested path, use it as-is
            fullPath = `/${item.slug}`;
          } else {
            // Item slug is just the final segment, build the full path
            const parentPath = buildRoutingPath(pageList.sys.id, pageLists);
            
            if (parentPath.length > 0 && pageList.slug && pageList.slug.trim()) {
              // Nested PageList: /parent1/parent2/.../pageListSlug/itemSlug
              fullPath = `/${[...parentPath.map(p => p.slug), pageList.slug, item.slug].join('/')}`;
            } else if (pageList.slug && pageList.slug.trim()) {
              // Direct PageList: /pageListSlug/itemSlug
              fullPath = `/${pageList.slug}/${item.slug}`;
            } else {
              // PageList without slug, item appears at root
              fullPath = `/${item.slug}`;
            }
          }
          
          // Additional check: if the generated path has duplicate segments, clean it up
          const pathSegments = fullPath.split('/').filter(Boolean);
          const uniqueSegments = [];
          for (let i = 0; i < pathSegments.length; i++) {
            // Only add segment if it's not the same as the previous one
            if (i === 0 || pathSegments[i] !== pathSegments[i - 1]) {
              uniqueSegments.push(pathSegments[i]);
            }
          }
          fullPath = `/${uniqueSegments.join('/')}`;

          // Determine priority and changefreq based on content type
          let priority = 0.6;
          let changefreq: RouteMetadata['changefreq'] = 'monthly';

          switch (item.__typename) {
            case 'Page':
              priority = 0.7;
              changefreq = 'weekly';
              break;
            case 'Product':
              priority = 0.7;
              changefreq = 'monthly';
              break;
            case 'Solution':
              priority = 0.7;
              changefreq = 'monthly';
              break;
            case 'Service':
              priority = 0.6;
              changefreq = 'monthly';
              break;
            case 'Post':
              priority = 0.6;
              changefreq = 'weekly';
              break;
            case 'PageList':
              priority = 0.8;
              changefreq = 'weekly';
              break;
          }

          // Build parent PageLists metadata
          let allParentPageLists: Array<{ id: string; slug: string; title: string }> = [];
          
          if (item.slug.includes('/')) {
            // For items with nested slugs, we need to determine parents from the slug structure
            // This is more complex, so for now we'll mark them as nested but with empty parent list
            allParentPageLists = [];
          } else {
            // For simple slugs, build the parent path normally
            const parentPath = buildRoutingPath(pageList.sys.id, pageLists);
            allParentPageLists = pageList.slug 
              ? [...parentPath, { id: pageList.sys.id, slug: pageList.slug, title: pageList.title || pageList.slug }]
              : parentPath;
          }

          routes[fullPath] = {
            path: fullPath,
            contentType: (item.__typename || 'Page') as RouteMetadata['contentType'],
            contentId: item.sys.id,
            title: item.title,
            parentPageLists: allParentPageLists,
            isNested: allParentPageLists.length > 0 || item.slug.includes('/'),
            priority,
            changefreq
          };
        }
      });
    }
  });

  // Filter out malformed routes
  const validRoutes: Record<string, RouteMetadata> = {};
  
  Object.entries(routes).forEach(([path, route]) => {
    // Skip malformed paths
    if (
      path === '//' ||                           // Double slash
      path.includes('//') ||                     // Contains double slashes
      path.endsWith('/undefined') ||             // Contains undefined
      path.includes('undefined') ||              // Contains undefined anywhere
      !path.startsWith('/') ||                   // Doesn't start with slash
      path.trim() === ''                         // Empty path
    ) {
      console.warn(`⚠️ Skipping malformed route: ${path}`);
      return;
    }
    
    validRoutes[path] = route;
  });

  return {
    routes: validRoutes,
    generatedAt: new Date().toISOString(),
    version: '1.0.0'
  };
}

/**
 * Generate redirects from routing cache
 */
function generateRedirects(routingCache: RoutingCache): Array<{
  source: string;
  destination: string;
  permanent: boolean;
}> {
  const redirects: Array<{ source: string; destination: string; permanent: boolean }> = [];
  const allRoutes = Object.keys(routingCache.routes);

  // Find potential redirects by looking for nested routes that could conflict with standalone routes
  allRoutes.forEach(route => {
    // Skip root route
    if (route === '/') return;

    // Look for nested routes (containing multiple segments)
    const segments = route.split('/').filter(Boolean);
    if (segments.length > 1) {
      // Check if there's a potential standalone route that should redirect to this nested route
      const lastSegment = segments[segments.length - 1];
      const potentialStandaloneRoute = `/${lastSegment}`;

      // Only create redirect if:
      // 1. The potential standalone route doesn't already exist as a real route
      // 2. The nested route exists
      // 3. The last segment is meaningful (not just an ID or very generic)
      if (
        !allRoutes.includes(potentialStandaloneRoute) &&
        allRoutes.includes(route) &&
        lastSegment &&
        lastSegment.length > 2 && // Avoid very short segments
        !lastSegment.match(/^\d+$/) && // Avoid numeric IDs
        !lastSegment.includes('-case-study') && // Avoid case study duplicates
        !lastSegment.includes('-product') // Avoid product suffix duplicates
      ) {
        redirects.push({
          source: potentialStandaloneRoute,
          destination: route,
          permanent: false // Temporary redirect as structure might change
        });
      }
    }
  });

  // Remove duplicates and sort
  const uniqueRedirects = redirects.filter((redirect, index, self) =>
    index === self.findIndex(r => r.source === redirect.source)
  );

  return uniqueRedirects.sort((a, b) => a.source.localeCompare(b.source));
}

/**
 * Generate XML sitemap content from routing cache
 */
function generateXmlSitemap(routingCache: RoutingCache): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = '</urlset>';

  const urlEntries = Object.values(routingCache.routes).map(route => {
    const fullUrl = route.path === '/' ? BASE_URL : `${BASE_URL}${route.path}`;
    let entry = `  <url>\n    <loc>${fullUrl}</loc>`;
    
    entry += `\n    <lastmod>${routingCache.generatedAt.split('T')[0]}</lastmod>`;
    entry += `\n    <changefreq>${route.changefreq}</changefreq>`;
    entry += `\n    <priority>${route.priority.toFixed(1)}</priority>`;
    
    entry += '\n  </url>';
    return entry;
  }).join('\n');

  return `${xmlHeader}\n${urlsetOpen}\n${urlEntries}\n${urlsetClose}`;
}

/**
 * Main function to generate routing sitemap
 */
async function generateRoutingSitemap(): Promise<void> {
  try {
    console.log('🚀 Generating routing sitemap...');
    console.log('Using environment:', CONTENTFUL_ENVIRONMENT);
    console.log('Base URL:', BASE_URL);

    const [standalonePages, pageLists, contentItems] = await Promise.all([
      getStandalonePages(),
      getPageListsWithPages(),
      getStandaloneContentItems()
    ]);

    console.log(`📄 Found ${standalonePages.length} standalone pages`);
    console.log(`📋 Found ${pageLists.length} page lists`);
    console.log(`🛍️ Found ${contentItems.products.length} standalone products`);
    console.log(`💡 Found ${contentItems.solutions.length} standalone solutions`);
    console.log(`🔧 Found ${contentItems.services.length} standalone services`);
    console.log(`📝 Found ${contentItems.posts.length} standalone posts`);

    // Generate routing cache
    const routingCache = generateRoutingCache(standalonePages, pageLists, contentItems);

    console.log(`\n🗺️ Generated ${Object.keys(routingCache.routes).length} routes:`);
    Object.values(routingCache.routes).forEach((route) => {
      const nestedIndicator = route.isNested ? ' (nested)' : '';
      console.log(`  - ${route.path} → ${route.contentType}${nestedIndicator}`);
    });

    // Write routing cache to src/lib for runtime access
    const routingCachePath = path.join(__dirname, '..', 'src', 'lib', 'routing-cache.json');
    fs.writeFileSync(routingCachePath, JSON.stringify(routingCache, null, 2));
    console.log(`\n💾 Routing cache written to: ${routingCachePath}`);

    // Generate and write XML sitemap
    const xmlContent = generateXmlSitemap(routingCache);
    const xmlOutputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    fs.writeFileSync(xmlOutputPath, xmlContent, 'utf8');
    console.log(`📄 Sitemap.xml written to: ${xmlOutputPath}`);

    // Write debug JSON for development
    const debugPath = path.join(__dirname, '..', 'routing-debug.json');
    fs.writeFileSync(debugPath, JSON.stringify(routingCache, null, 2));
    console.log(`🐛 Debug JSON written to: ${debugPath}`);

    // Generate redirects based on the routing cache
    const redirects = generateRedirects(routingCache);
    const redirectsPath = path.join(__dirname, '..', 'src', 'lib', 'route-redirects.json');
    fs.writeFileSync(redirectsPath, JSON.stringify(redirects, null, 2));
    console.log(`🔀 Route redirects written to: ${redirectsPath}`);

    console.log(`\n✅ Routing sitemap generation complete!`);
    console.log(`   - Total routes: ${Object.keys(routingCache.routes).length}`);
    console.log(`   - Total redirects: ${redirects.length}`);
    console.log(`   - Generated at: ${routingCache.generatedAt}`);

  } catch (error) {
    console.error('❌ Error generating routing sitemap:', error instanceof Error ? error.message : String(error));
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateRoutingSitemap();
}

export { generateRoutingSitemap };
