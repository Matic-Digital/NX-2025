/**
 * Sitemap to Schema Integration
 *
 * Reads sitemap data and integrates it into Schema.org structured data
 * This ensures the schema reflects the actual site structure after build
 */

import fs from 'fs';
import path from 'path';

interface SitemapUrl {
  url: string;
  title?: string;
  description?: string;
  type?: 'page' | 'collection' | 'article' | 'product' | 'service' | 'contact';
  priority?: number;
  changefreq?: string;
}

/**
 * Read sitemap URLs from generated files
 */
export async function readSitemapUrls(): Promise<SitemapUrl[]> {
  const sitemapUrls: SitemapUrl[] = [];

  try {
    // Try to read from sitemap-urls.json (if it exists)
    const sitemapJsonPath = path.join(process.cwd(), 'sitemap-urls.json');
    if (fs.existsSync(sitemapJsonPath)) {
      const sitemapData = JSON.parse(fs.readFileSync(sitemapJsonPath, 'utf-8')) as unknown;
      const _sitemapArray = Array.isArray(sitemapData) ? sitemapData : [];

      if (Array.isArray(sitemapData)) {
        const mappedUrls = sitemapData.map((item: unknown) => {
          // Extract URL with better validation
          let url: string | null = null;
          if (typeof item === 'string') {
            url = item;
          } else if (item && typeof item === 'object') {
            const itemObj = item as Record<string, unknown>;
            const urlValue = itemObj.loc ?? itemObj.url;
            url = typeof urlValue === 'string' ? urlValue : null;
          }

          const itemObj =
            typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
          return {
            url: url!,
            title: itemObj.title as string | undefined,
            description: itemObj.description as string | undefined,
            type: (itemObj.type as SitemapUrl['type']) ?? 'page',
            priority: itemObj.priority as number | undefined,
            changefreq: itemObj.changefreq as string | undefined
          };
        });

        // Validate URLs before adding
        const validUrls = mappedUrls.filter((item) => {
          if (!item.url || typeof item.url !== 'string') {
            return false;
          }
          return true;
        });

        sitemapUrls.push(...validUrls);
      }
    }

    // If no JSON sitemap, try to parse XML sitemap
    if (sitemapUrls.length === 0) {
      const xmlSitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
      if (fs.existsSync(xmlSitemapPath)) {
        const xmlContent = fs.readFileSync(xmlSitemapPath, 'utf-8');
        const urlRegex = /<url>[\s\S]*?<\/url>/g;
        const urlMatches: string[] = [];
        let match;
        while ((match = urlRegex.exec(xmlContent)) !== null) {
          urlMatches.push(match[0]);
        }

        if (urlMatches.length > 0) {
          urlMatches.forEach((urlBlock) => {
            const locRegex = /<loc>(.*?)<\/loc>/;
            const priorityRegex = /<priority>(.*?)<\/priority>/;
            const changefreqRegex = /<changefreq>(.*?)<\/changefreq>/;

            const locMatch = locRegex.exec(urlBlock);
            const priorityMatch = priorityRegex.exec(urlBlock);
            const changefreqMatch = changefreqRegex.exec(urlBlock);

            if (locMatch?.[1]) {
              sitemapUrls.push({
                url: locMatch[1],
                type: inferPageType(locMatch[1]),
                priority: priorityMatch?.[1] ? parseFloat(priorityMatch[1]) : undefined,
                changefreq: changefreqMatch?.[1] ?? undefined
              });
            }
          });
        }
      }
    }
  } catch (error) {
        console.warn('Error in catch block:', error);
      }

  return sitemapUrls;
}

/**
 * Infer page type from URL pattern based on actual sitemap structure
 */
function inferPageType(url: string): SitemapUrl['type'] {
  try {
    const path = new URL(url).pathname.toLowerCase();

    // Posts are structured as /post/category/slug (blog, case-study, data-sheet, press-release)
    if (path.includes('/post/')) return 'article';
    if (path.includes('/contact')) return 'contact';
    if (path === '/') return 'page';

    // Regional pages are individual pages
    if (
      path.includes('/americas') ||
      path.includes('/europe') ||
      path.includes('/asia-pacific') ||
      path.includes('/middle-east-africa-and-india')
    ) {
      return 'page';
    }

    // Main navigation pages
    if (
      ['about', 'company', 'contact', 'newsroom', 'resources', 'careers', 'showcase'].some(
        (section) => path === `/${section}`
      )
    ) {
      return 'page';
    }

    // Everything else is likely a page (products, solutions, etc.)
    return 'page';
  } catch {
    return 'page';
  }
}

/**
 * Generate navigation schema from sitemap data
 */
export function generateNavigationFromSitemap(
  sitemapUrls: SitemapUrl[],
  _baseUrl: string
): Record<string, unknown>[] {
  // Filter to main navigation items (top-level pages with high priority)
  const navItems = sitemapUrls
    .filter((item) => {
      // Skip items without valid URL
      if (!item?.url || typeof item.url !== 'string') {
        return false;
      }

      // Additional validation for URL format
      if (item.url === '[object Object]' || typeof item.url === 'object') {
        return false;
      }

      try {
        const path = new URL(item.url).pathname;
        const segments = path.split('/').filter(Boolean);

        // Include homepage and top-level pages
        return (
          path === '/' ||
          (segments.length === 1 && (item.priority ?? 0) >= 0.7) ||
          (segments[0] &&
            ['products', 'services', 'solutions', 'about', 'contact', 'blog', 'events'].includes(
              segments[0]
            ))
        );
      } catch {
        return false;
      }
    })
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
    .slice(0, 8); // Limit to 8 main nav items

  return navItems
    .map((item, index) => {
      // Additional safety check before URL creation
      if (!item?.url || typeof item.url !== 'string' || item.url === '[object Object]') {
        return null;
      }

      try {
        const path = new URL(item.url).pathname;
        const name =
          item.title ?? path.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') ?? 'Home';

        return {
          '@type': 'ListItem',
          position: index + 1,
          name: name.charAt(0).toUpperCase() + name.slice(1),
          description: item.description,
          item: {
            '@type': getSchemaTypeFromPageType(item.type ?? 'page'),
            '@id': `${item.url}#${item.type ?? 'page'}`,
            url: item.url,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            description: item.description
          }
        };
      } catch {
        // Fallback for invalid URLs
        return {
          '@type': 'ListItem',
          position: index + 1,
          name: item.title ?? 'Page',
          item: {
            '@type': 'WebPage',
            url: item.url,
            name: item.title ?? 'Page'
          }
        };
      }
    })
    .filter((item) => item !== null);
}

/**
 * Generate hasPart references from sitemap
 */
export function generateHasPartFromSitemap(sitemapUrls: SitemapUrl[]): Record<string, unknown>[] {
  // Group URLs by main sections
  const sections = new Map<string, SitemapUrl[]>();

  sitemapUrls.forEach((item) => {
    // Skip items without valid URL
    if (!item?.url || typeof item.url !== 'string') {
      return;
    }

    // Additional validation for URL format
    if (item.url === '[object Object]' || typeof item.url === 'object') {
      return;
    }

    try {
      const path = new URL(item.url).pathname;
      const segments = path.split('/').filter(Boolean);

      if (segments.length > 0 && segments[0]) {
        const section = segments[0];
        if (!sections.has(section)) {
          sections.set(section, []);
        }
        const sectionItems = sections.get(section);
        if (sectionItems) {
          sectionItems.push(item);
        }
      }
    } catch (error) {
        console.warn('Error in catch block:', error);
      }
  });

  // Convert sections to hasPart references
  const hasPart: Record<string, unknown>[] = [];

  sections.forEach((items, sectionName) => {
    // Only include sections with multiple items or high-priority single items
    if (items.length > 1 || (items[0] && (items[0].priority ?? 0) >= 0.8)) {
      const mainItem =
        items.find((item) => {
          if (!item.url || typeof item.url !== 'string') return false;
          try {
            const path = new URL(item.url).pathname;
            return path === `/${sectionName}` || path === `/${sectionName}/`;
          } catch {
            return false;
          }
        }) ?? items[0];

      if (mainItem) {
        hasPart.push({
          '@type': getSchemaTypeFromPageType(mainItem.type ?? 'page'),
          '@id': `${mainItem.url}#${mainItem.type ?? 'page'}`,
          url: mainItem.url,
          name:
            mainItem.title ??
            sectionName.charAt(0).toUpperCase() + sectionName.slice(1).replace(/-/g, ' '),
          description: mainItem.description,
          // Add sub-pages if it's a collection
          ...(items.length > 1 &&
            mainItem.type === 'collection' && {
              hasPart: items
                .filter((item) => item !== mainItem)
                .slice(0, 10) // Limit sub-items
                .map((subItem) => ({
                  '@type': getSchemaTypeFromPageType(subItem.type ?? 'page'),
                  '@id': `${subItem.url}#${subItem.type ?? 'page'}`,
                  url: subItem.url,
                  name: subItem.title ?? subItem.url.split('/').pop()?.replace(/-/g, ' ')
                }))
            })
        });
      }
    }
  });

  return hasPart.slice(0, 10); // Limit to 10 main sections
}

/**
 * Map page type to Schema.org type
 */
function getSchemaTypeFromPageType(pageType: SitemapUrl['type']): string {
  switch (pageType) {
    case 'article':
      return 'Article';
    case 'product':
      return 'Product';
    case 'service':
      return 'Service';
    case 'contact':
      return 'ContactPage';
    case 'collection':
      return 'CollectionPage';
    default:
      return 'WebPage';
  }
}

/**
 * Enhanced WebSite schema generator that uses actual sitemap data
 */
export async function generateWebSiteSchemaFromSitemap(
  baseUrl: string
): Promise<Record<string, unknown>> {
  const sitemapUrls = await readSitemapUrls();

  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}#website`,
    name: 'PlaceholderCorp',
    url: baseUrl,
    description: 'Leading provider of solar tracking solutions and renewable energy technology',
    publisher: {
      '@type': 'Organization',
      '@id': `${baseUrl}#organization`
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  if (sitemapUrls.length > 0) {
    return {
      ...baseSchema,
      mainEntity: {
        '@type': 'ItemList',
        '@id': `${baseUrl}#navigation`,
        name: 'Main Navigation',
        itemListElement: generateNavigationFromSitemap(sitemapUrls, baseUrl)
      },
      hasPart: generateHasPartFromSitemap(sitemapUrls)
    };
  }

  return baseSchema;
}
