#!/usr/bin/env tsx

/**
 * Comprehensive sitemap generator for Next.js application
 * Fetches all pages, page lists, products, solutions, services, and posts from Contentful
 * Generates both Pa11y URLs and proper XML sitemap
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
const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
  console.error('Missing required Contentful environment variables:');
  console.error('NEXT_PUBLIC_CONTENTFUL_SPACE_ID:', CONTENTFUL_SPACE_ID ? 'Set' : 'Missing');
  console.error(
    'NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN:',
    CONTENTFUL_ACCESS_TOKEN ? 'Set' : 'Missing'
  );
  process.exit(1);
}

// GraphQL endpoint
const GRAPHQL_ENDPOINT = `https://graphql.contentful.com/content/v1/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}`;

interface ContentfulPage {
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

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
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
async function getStandalonePages(): Promise<ContentfulPage[]> {
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

  const response = await fetchGraphQL<{ pageCollection: { items: ContentfulPage[] } }>(query);
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
  products: ContentfulPage[];
  solutions: ContentfulPage[];
  services: ContentfulPage[];
  posts: ContentfulPage[];
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
      query: `query { postCollection(limit: 100) { items { sys { id } title slug __typename } } }`
    }
  ];

  const results = await Promise.all(
    queries.map(async ({ name, query }) => {
      try {
        const response = await fetchGraphQL<Record<string, { items: ContentfulPage[] }>>(query);
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
): string[] {
  if (visited.has(itemId)) return []; // Prevent infinite loops
  visited.add(itemId);

  for (const pageList of pageLists) {
    if (!pageList.pagesCollection?.items?.length) continue;

    const foundItem = pageList.pagesCollection.items.find((item) => item?.sys?.id === itemId);

    if (foundItem && pageList.slug) {
      const parentPath = buildRoutingPath(pageList.sys.id, pageLists, visited);
      return [...parentPath, pageList.slug];
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
 * Generate sitemap URLs with metadata from all content
 */
function generateSitemapUrls(
  standalonePages: ContentfulPage[],
  pageLists: ContentfulPageList[],
  contentItems: {
    products: ContentfulPage[];
    solutions: ContentfulPage[];
    services: ContentfulPage[];
    posts: ContentfulPage[];
  }
): SitemapUrl[] {
  const urls: SitemapUrl[] = [];

  // Add homepage with highest priority
  urls.push({
    loc: BASE_URL,
    changefreq: 'daily',
    priority: 1.0,
    lastmod: new Date().toISOString().split('T')[0]
  });

  // Add standalone pages
  standalonePages.forEach((page) => {
    if (page.slug && page.slug.trim() && !isItemInPageList(page.sys.id, pageLists)) {
      urls.push({
        loc: `${BASE_URL}/${page.slug}`,
        changefreq: 'weekly',
        priority: 0.8
      });
    }
  });

  // Add standalone content items
  const contentTypeConfig = [
    { items: contentItems.products, priority: 0.7, changefreq: 'monthly' as const },
    { items: contentItems.solutions, priority: 0.7, changefreq: 'monthly' as const },
    { items: contentItems.services, priority: 0.6, changefreq: 'monthly' as const },
    { items: contentItems.posts, priority: 0.6, changefreq: 'weekly' as const }
  ];

  contentTypeConfig.forEach(({ items, priority, changefreq }) => {
    items.forEach((item) => {
      if (item.slug && item.slug.trim() && !isItemInPageList(item.sys.id, pageLists)) {
        urls.push({
          loc: `${BASE_URL}/${item.slug}`,
          changefreq,
          priority
        });
      }
    });
  });

  // Add PageList pages and their nested content
  pageLists.forEach((pageList) => {
    // Add PageList itself if it has a slug
    if (pageList.slug && pageList.slug.trim()) {
      urls.push({
        loc: `${BASE_URL}/${pageList.slug}`,
        changefreq: 'weekly',
        priority: 0.8
      });
    }

    // Add pages within the PageList
    if (pageList.pagesCollection?.items) {
      pageList.pagesCollection.items.forEach((item) => {
        if (!item) return;

        // Skip external pages for sitemap
        if (item.__typename === 'ExternalPage') {
          return;
        }

        if (item.slug && item.slug.trim()) {
          const parentPath = buildRoutingPath(pageList.sys.id, pageLists);
          let fullPath: string;
          
          if (parentPath.length > 0 && pageList.slug && pageList.slug.trim()) {
            // Nested PageList: /parent1/parent2/.../pageListSlug/itemSlug
            fullPath = [...parentPath, pageList.slug, item.slug].filter(Boolean).join('/');
          } else if (pageList.slug && pageList.slug.trim()) {
            // Direct PageList: /pageListSlug/itemSlug
            fullPath = `${pageList.slug}/${item.slug}`;
          } else {
            // PageList without slug, item appears at root
            fullPath = item.slug;
          }

          // Determine priority and changefreq based on content type
          let priority = 0.6;
          let changefreq: SitemapUrl['changefreq'] = 'monthly';

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

          urls.push({
            loc: `${BASE_URL}/${fullPath}`,
            changefreq,
            priority
          });
        }
      });
    }
  });

  // Remove duplicates, filter out malformed URLs, and sort by URL
  const uniqueUrls = urls.filter((url, index, self) => 
    index === self.findIndex(u => u.loc === url.loc)
  );

  // Filter out malformed URLs
  const validUrls = uniqueUrls.filter((url) => {
    // Remove URLs with double slashes (except after protocol)
    if (url.loc.includes('//') && !url.loc.match(/^https?:\/\/[^/]/)) {
      return false;
    }
    // Remove empty or invalid URLs
    if (!url.loc || url.loc.endsWith('//') || url.loc.endsWith('/undefined') || url.loc.includes('undefined')) {
      return false;
    }
    return true;
  });

  return validUrls.sort((a, b) => a.loc.localeCompare(b.loc));
}

/**
 * Generate URLs from pages and page lists (for Pa11y compatibility)
 */
function generateUrls(
  standalonePages: ContentfulPage[],
  pageLists: ContentfulPageList[]
): string[] {
  const urls = new Set<string>();

  // Add homepage
  urls.add(BASE_URL);

  // Add standalone pages
  standalonePages.forEach((page) => {
    if (page.slug) {
      urls.add(`${BASE_URL}/${page.slug}`);
    }
  });

  // Add PageList pages
  pageLists.forEach((pageList) => {
    // Add PageList itself if it has a slug
    if (pageList.slug) {
      urls.add(`${BASE_URL}/${pageList.slug}`);
    }

    // Add pages within the PageList
    if (pageList.pagesCollection?.items) {
      pageList.pagesCollection.items.forEach((page) => {
        if (!page) return;

        // Skip external pages for Pa11y testing
        if (page.__typename === 'ExternalPage') {
          return;
        }

        if (page.slug) {
          if (pageList.slug) {
            // Nested page: /pageListSlug/pageSlug
            urls.add(`${BASE_URL}/${pageList.slug}/${page.slug}`);
          } else {
            // Standalone page in PageList without slug
            urls.add(`${BASE_URL}/${page.slug}`);
          }
        }
      });
    }
  });

  // Filter out malformed URLs and clean up
  const validUrls = Array.from(urls).filter((url) => {
    // Remove URLs with double slashes (except after protocol)
    if (url.includes('//') && !url.match(/^https?:\/\//)) {
      return false;
    }
    // Remove empty or invalid URLs
    if (!url || url.endsWith('//')) {
      return false;
    }
    return true;
  });

  return validUrls.sort();
}

/**
 * Generate XML sitemap content
 */
function generateXmlSitemap(urls: SitemapUrl[]): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = '</urlset>';

  const urlEntries = urls.map(url => {
    let entry = `  <url>\n    <loc>${url.loc}</loc>`;
    
    if (url.lastmod) {
      entry += `\n    <lastmod>${url.lastmod}</lastmod>`;
    }
    
    if (url.changefreq) {
      entry += `\n    <changefreq>${url.changefreq}</changefreq>`;
    }
    
    if (url.priority !== undefined) {
      entry += `\n    <priority>${url.priority.toFixed(1)}</priority>`;
    }
    
    entry += '\n  </url>';
    return entry;
  }).join('\n');

  return `${xmlHeader}\n${urlsetOpen}\n${urlEntries}\n${urlsetClose}`;
}

/**
 * Main function to generate sitemap
 */
async function generateSitemap(): Promise<string[]> {
  try {
    console.log('Fetching content from Contentful...');
    console.log('Using environment:', CONTENTFUL_ENVIRONMENT);
    console.log('Base URL:', BASE_URL);

    const [standalonePages, pageLists, contentItems] = await Promise.all([
      getStandalonePages(),
      getPageListsWithPages(),
      getStandaloneContentItems()
    ]);

    console.log(`Found ${standalonePages.length} standalone pages`);
    console.log(`Found ${pageLists.length} page lists`);
    console.log(`Found ${contentItems.products.length} standalone products`);
    console.log(`Found ${contentItems.solutions.length} standalone solutions`);
    console.log(`Found ${contentItems.services.length} standalone services`);
    console.log(`Found ${contentItems.posts.length} standalone posts`);

    // Generate Pa11y URLs (for backward compatibility)
    const urls = generateUrls(standalonePages, pageLists);

    console.log(`\nGenerated ${urls.length} URLs for Pa11y testing:`);
    urls.forEach((url) => console.log(`  - ${url}`));

    // Write URLs to a file for Pa11y
    const outputPath = path.join(__dirname, '..', 'pa11y-urls.json');
    fs.writeFileSync(outputPath, JSON.stringify(urls, null, 2));

    console.log(`\nPa11y URLs written to: ${outputPath}`);

    // Generate comprehensive sitemap URLs with metadata
    const sitemapUrls = generateSitemapUrls(standalonePages, pageLists, contentItems);

    console.log(`\nGenerated ${sitemapUrls.length} URLs for sitemap.xml:`);
    sitemapUrls.forEach((url) => console.log(`  - ${url.loc} (priority: ${url.priority}, changefreq: ${url.changefreq})`));

    // Generate XML content
    const xmlContent = generateXmlSitemap(sitemapUrls);

    // Write sitemap.xml to public directory
    const xmlOutputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    fs.writeFileSync(xmlOutputPath, xmlContent, 'utf8');

    console.log(`\nSitemap.xml written to: ${xmlOutputPath}`);
    console.log(`Total URLs in sitemap: ${sitemapUrls.length}`);

    // Also write a JSON version for debugging
    const jsonOutputPath = path.join(__dirname, '..', 'sitemap-urls.json');
    fs.writeFileSync(jsonOutputPath, JSON.stringify(sitemapUrls, null, 2));
    console.log(`Debug JSON written to: ${jsonOutputPath}`);

    return urls;
  } catch (error) {
    console.error(
      'Error generating sitemap:',
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      'Stack trace:',
      error instanceof Error ? error.stack : 'No stack trace available'
    );
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSitemap();
}

export { generateSitemap };
