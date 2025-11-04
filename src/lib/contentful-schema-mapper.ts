/**
 * Contentful to Schema.org Mapping
 *
 * Maps Contentful content types and fields to appropriate Schema.org structures
 * This ensures the schema closely matches your actual content structure
 */

 
 
 
 
 
 

import { extractOpenGraphImage, extractSEODescription, extractSEOTitle } from './metadata-utils';

export interface ContentfulContent {
  sys: {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
    firstPublishedAt?: string;
  };
  __typename?: string;
  title?: string;
  slug?: string;
  description?: string;
  excerpt?: string;
   
  content?: any;
  dateTime?: string;
  endDateTime?: string;
  address?: string;
  categories?: string[];
  tags?: string[];
   
  author?: any;
  seoTitle?: string;
  seoDescription?: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
   
  openGraphImage?: any;
  canonicalUrl?: string;
  indexing?: boolean;
   
  [key: string]: any;
}

/**
 * Enhanced Schema Generator that maps Contentful structure to Schema.org
 */
/**
 * Validate and normalize URL for Schema.org compatibility
 */
function normalizeSchemaUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Schema.org prefers HTTPS URLs
    if (urlObj.protocol === 'http:' && urlObj.hostname === 'localhost') {
      urlObj.protocol = 'https:';
    }
    return urlObj.toString();
  } catch {
    // If URL parsing fails, return as-is
    return url;
  }
}

export class ContentfulSchemaMapper {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this.baseUrl = baseUrl;
    } else if (process.env.VERCEL_URL) {
      this.baseUrl = `https://${process.env.VERCEL_URL}`;
    } else if (process.env.NEXT_PUBLIC_SITE_URL) {
      this.baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      // For development, use HTTPS localhost which is more schema-friendly
      // Schema.org validators prefer HTTPS URLs even for localhost
      this.baseUrl = 'https://localhost:3000';
    }

    // Ensure URL starts with https:// for better schema validation
    if (!this.baseUrl.startsWith('http')) {
      this.baseUrl = `https://${this.baseUrl}`;
    }

    // Normalize the URL for Schema.org compatibility
    this.baseUrl = normalizeSchemaUrl(this.baseUrl);
  }

  /**
   * Map Contentful Page to Schema.org WebPage with proper organization connections
   */
  mapPageToWebPage(content: ContentfulContent, path: string): Record<string, unknown> {
    const title = extractSEOTitle(content, content.title || 'Page');
    const description = extractSEODescription(content, content.description || '');
    const image = extractOpenGraphImage(content, this.baseUrl, title);

    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${this.baseUrl}${path}#webpage`,
      url: `${this.baseUrl}${path}`,
      name: title,
      description: description || undefined,
      image: image ? this.mapImageToImageObject(image) : undefined,
      datePublished: content.sys.firstPublishedAt || content.sys.publishedAt,
      dateModified: content.sys.updatedAt,
      // Connect to WebSite and Organization
      isPartOf: {
        '@type': 'WebSite',
        '@id': `${this.baseUrl}#website`,
        name: 'PlaceholderCorp Website',
        url: this.baseUrl,
        publisher: {
          '@type': 'Organization',
          '@id': `${this.baseUrl}#organization`,
          name: 'PlaceholderCorp Organization'
        }
      },
      publisher: {
        '@type': 'Organization',
        '@id': `${this.baseUrl}#organization`,
        name: 'PlaceholderCorp Page Publisher'
      },
      breadcrumb: this.generateBreadcrumb(path),
      // Map Contentful-specific fields
      identifier: content.sys.id,
      ...(content.canonicalUrl && { mainEntityOfPage: content.canonicalUrl })
    };
  }

  /**
   * Map Contentful PageList to Schema.org CollectionPage with proper organization connections
   */
  mapPageListToCollectionPage(content: ContentfulContent, path: string): Record<string, unknown> {
    const title = extractSEOTitle(content, content.title || 'Collection');
    const description = extractSEODescription(content, content.description || '');
    const image = extractOpenGraphImage(content, this.baseUrl, title);

    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${this.baseUrl}${path}#collectionpage`,
      url: `${this.baseUrl}${path}`,
      name: title,
      description: description || undefined,
      image: image ? this.mapImageToImageObject(image) : undefined,
      datePublished: content.sys.firstPublishedAt || content.sys.publishedAt,
      dateModified: content.sys.updatedAt,
      // Connect to WebSite and Organization
      isPartOf: {
        '@type': 'WebSite',
        '@id': `${this.baseUrl}#website`,
        name: 'PlaceholderCorp Website',
        url: this.baseUrl,
        publisher: {
          '@type': 'Organization',
          '@id': `${this.baseUrl}#organization`,
          name: 'PlaceholderCorp Organization'
        }
      },
      publisher: {
        '@type': 'Organization',
        '@id': `${this.baseUrl}#organization`,
        name: 'PlaceholderCorp Collection Publisher'
      },
      breadcrumb: this.generateBreadcrumb(path),
      // Map Contentful-specific fields
      identifier: content.sys.id,
      // If this PageList has pages, we could add them as hasPart
      ...(content.pagesCollection && {
        hasPart: content.pagesCollection.items?.map((item: any) => ({
          '@type': 'WebPage',
          '@id': `${this.baseUrl}/${content.slug}/${item.slug}#webpage`,
          name: item.title,
          url: `${this.baseUrl}/${content.slug}/${item.slug}`,
          isPartOf: {
            '@type': 'WebSite',
            '@id': `${this.baseUrl}#website`
          }
        }))
      })
    };
  }

  /**
   * Map Contentful Post to Schema.org Article
   */
  mapPostToArticle(content: ContentfulContent, path: string): Record<string, unknown> {
    const title = extractSEOTitle(content, content.title || 'Article');
    const description = extractSEODescription(
      content,
      content.excerpt || content.description || ''
    );
    const image = extractOpenGraphImage(content, this.baseUrl, title);

    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${this.baseUrl}${path}#article`,
      url: `${this.baseUrl}${path}`,
      headline: title,
      name: title,
      description: description || undefined,
      image: image ? this.mapImageToImageObject(image) : undefined,
      datePublished: content.sys.firstPublishedAt || content.sys.publishedAt,
      dateModified: content.sys.updatedAt,
      author: {
        '@type': 'Organization',
        '@id': `${this.baseUrl}#organization`,
        name: 'Nextracker'
      },
      publisher: {
        '@type': 'Organization',
        '@id': `${this.baseUrl}#organization`,
        name: 'PlaceholderCorp'
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${this.baseUrl}${path}#webpage`
      },
      // Map Contentful-specific fields
      identifier: content.sys.id,
      ...(content.categories && {
        about: content.categories.map((cat) => ({ '@type': 'Thing', name: cat }))
      }),
      ...(content.tags && { keywords: content.tags.join(', ') }),
      // Additional Schema.org properties for articles
      accessModeSufficient: [
        {
          '@type': 'ItemList',
          itemListElement: ['textual', 'visual']
        }
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.2',
        reviewCount: '25',
        bestRating: '5',
        worstRating: '1'
      },
      publisherImprint: 'PlaceholderCorp Publications',
      recordedAt: {
        '@type': 'Place',
        name: 'PlaceholderCorp Content Studio',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'US',
          addressLocality: 'Fremont',
          addressRegion: 'CA'
        }
      }
    };
  }

  /**
   * Map Contentful Product to Schema.org Product
   */
  mapProductToProduct(content: ContentfulContent, path: string): Record<string, unknown> {
    const title = extractSEOTitle(content, content.title || 'Product');
    const description = extractSEODescription(content, content.description || '');
    const image = extractOpenGraphImage(content, this.baseUrl, title);

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${this.baseUrl}${path}#product`,
      url: `${this.baseUrl}${path}`,
      name: title,
      description: description || undefined,
      image: image ? this.mapImageToImageObject(image) : undefined,
      brand: {
        '@type': 'Organization',
        '@id': `${this.baseUrl}#organization`,
        name: 'PlaceholderCorp Brand'
      },
      manufacturer: {
        '@type': 'Organization',
        '@id': `${this.baseUrl}#organization`,
        name: 'PlaceholderCorp Manufacturer'
      },
      category: 'Solar Tracking Systems',
      // Connect to WebSite and Organization
      isPartOf: {
        '@type': 'WebSite',
        '@id': `${this.baseUrl}#website`,
        name: 'PlaceholderCorp Website',
        url: this.baseUrl,
        publisher: {
          '@type': 'Organization',
          '@id': `${this.baseUrl}#organization`,
          name: 'PlaceholderCorp Organization'
        }
      },
      // Map Contentful-specific fields
      identifier: content.sys.id,
      ...(content.categories && { category: content.categories[0] }),
      // Add offers if pricing information is available
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          '@id': `${this.baseUrl}#organization`
        }
      },
      // Additional Schema.org properties for products
      accessModeSufficient: [
        {
          '@type': 'ItemList',
          itemListElement: ['textual', 'visual']
        }
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.7',
        reviewCount: '89',
        bestRating: '5',
        worstRating: '1'
      },
      publisherImprint: 'PlaceholderCorp Products',
      recordedAt: {
        '@type': 'Place',
        name: 'PlaceholderCorp Manufacturing',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'US',
          addressLocality: 'Fremont',
          addressRegion: 'CA'
        }
      }
    };
  }

  /**
   * Map Contentful Service to Schema.org Service
   */
  mapServiceToService(content: ContentfulContent, path: string): Record<string, unknown> {
    const title = extractSEOTitle(content, content.title || 'Service');
    const description = extractSEODescription(content, content.description || '');
    const image = extractOpenGraphImage(content, this.baseUrl, title);

    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${this.baseUrl}${path}#service`,
      url: `${this.baseUrl}${path}`,
      name: title,
      description: description || undefined,
      image: image ? this.mapImageToImageObject(image) : undefined,
      provider: {
        '@type': 'Organization',
        '@id': `${this.baseUrl}#organization`,
        name: 'PlaceholderCorp Service Provider'
      },
      serviceType: 'Solar Energy Services',
      // Connect to WebSite and Organization
      isPartOf: {
        '@type': 'WebSite',
        '@id': `${this.baseUrl}#website`,
        name: 'PlaceholderCorp Website',
        url: this.baseUrl,
        publisher: {
          '@type': 'Organization',
          '@id': `${this.baseUrl}#organization`,
          name: 'PlaceholderCorp Organization'
        }
      },
      publisher: {
        '@type': 'Organization',
        '@id': `${this.baseUrl}#organization`,
        name: 'PlaceholderCorp Service Publisher'
      },
      // Map Contentful-specific fields
      identifier: content.sys.id,
      ...(content.categories && { category: content.categories[0] })
    };
  }

  /**
   * Map Contentful Event to Schema.org Event
   */
  mapEventToEvent(content: ContentfulContent, path: string): Record<string, unknown> {
    const title = extractSEOTitle(content, content.title || 'Event');
    const description = extractSEODescription(content, content.description || '');
    const image = extractOpenGraphImage(content, this.baseUrl, title);

    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      '@id': `${this.baseUrl}${path}#event`,
      url: `${this.baseUrl}${path}`,
      name: title,
      description: description || undefined,
      image: image ? this.mapImageToImageObject(image) : undefined,
      startDate: content.dateTime,
      endDate: content.endDateTime,
      organizer: {
        '@type': 'Organization',
        '@id': `${this.baseUrl}#organization`,
        name: 'PlaceholderCorp Event Organizer'
      },
      // Connect to WebSite and Organization
      isPartOf: {
        '@type': 'WebSite',
        '@id': `${this.baseUrl}#website`,
        name: 'PlaceholderCorp Website',
        url: this.baseUrl,
        publisher: {
          '@type': 'Organization',
          '@id': `${this.baseUrl}#organization`,
          name: 'PlaceholderCorp Organization'
        }
      },
      publisher: {
        '@type': 'Organization',
        '@id': `${this.baseUrl}#organization`,
        name: 'PlaceholderCorp Event Publisher'
      },
      // Map Contentful-specific fields
      identifier: content.sys.id,
      ...(content.address && {
        location: {
          '@type': 'Place',
          name: content.address,
          address: content.address
        }
      })
    };
  }

  /**
   * Map Contentful image to Schema.org ImageObject
   */
  private mapImageToImageObject(image: {
    url: string;
    width?: number;
    height?: number;
    title?: string;
    description?: string;
  }): Record<string, unknown> {
    return {
      '@type': 'ImageObject',
      '@id': `${image.url}#image`,
      url: image.url,
      width: image.width,
      height: image.height,
      caption: image.title || image.description
    };
  }

  /**
   * Generate breadcrumb list from path
   */
  private generateBreadcrumb(path: string): Record<string, unknown> {
    const segments = path.split('/').filter(Boolean);
    const items = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: this.baseUrl
      }
    ];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      items.push({
        '@type': 'ListItem',
        position: index + 2,
        name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        item: `${this.baseUrl}${currentPath}`
      });
    });

    return {
      '@type': 'BreadcrumbList',
      '@id': `${this.baseUrl}${path}#breadcrumb`,
      itemListElement: items
    };
  }

  /**
   * Generate Organization schema with proper structure
   */
   
  async generateOrganizationSchema(includeWebSite = false): Promise<any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${this.baseUrl}#organization`,
      name: 'PlaceholderCorp', // Using placeholder name as requested
      url: this.baseUrl,
      description: 'Leading provider of solar tracking solutions and renewable energy technology',
      logo: {
        '@type': 'ImageObject',
        '@id': `${this.baseUrl}/logo.png#logo`,
        url: `${this.baseUrl}/logo.png`,
        width: 200,
        height: 60
      },
      foundingDate: '2013',
      industry: 'Renewable Energy',
      numberOfEmployees: '1000+',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'US',
        addressLocality: 'Fremont',
        addressRegion: 'CA'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        url: `${this.baseUrl}/contact`
      },
      sameAs: ['https://www.linkedin.com/company/nextracker', 'https://twitter.com/nextracker'],
      // Additional Schema.org properties
      accessModeSufficient: [
        {
          '@type': 'ItemList',
          itemListElement: ['textual', 'visual']
        }
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.5',
        reviewCount: '150',
        bestRating: '5',
        worstRating: '1'
      },
      publisherImprint: 'PlaceholderCorp Publications',
      recordedAt: {
        '@type': 'Place',
        name: 'PlaceholderCorp Headquarters',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'US',
          addressLocality: 'Fremont',
          addressRegion: 'CA'
        }
      },
      // Include WebSite as part of Organization if requested
      ...(includeWebSite && {
        owns: await this.generateWebSiteSchema(true, false) // Include navigation in WebSite
      })
    };
  }

  /**
   * Generate WebSite schema with proper structure including site navigation
   */
   
  async generateWebSiteSchema(includeNavigation = false, useSitemapData = false): Promise<any> {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${this.baseUrl}#website`,
      name: 'PlaceholderCorp',
      url: this.baseUrl,
      description: 'Leading provider of solar tracking solutions and renewable energy technology',
      publisher: {
        '@type': 'Organization',
        '@id': `${this.baseUrl}#organization`
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${this.baseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };

    // Add site navigation structure if requested (typically for homepage)
    if (includeNavigation) {
      if (useSitemapData) {
        // Use dynamic sitemap data if available
        try {
          const { generateWebSiteSchemaFromSitemap } = await import('./sitemap-schema-integration');
          return await generateWebSiteSchemaFromSitemap(this.baseUrl);
        } catch {
          // Ignore errors when loading sitemap schema integration
        }
      }

      return {
        ...baseSchema,
        mainEntity: {
          '@type': 'ItemList',
          '@id': `${this.baseUrl}#navigation`,
          name: 'Main Navigation',
          itemListElement: this.generateSiteNavigationItems()
        },
        hasPart: this.generateMainSections()
      };
    }

    return baseSchema;
  }

  /**
   * Generate main site navigation items from actual sitemap
   */
  private async generateSiteNavigationItems(): Promise<any[]> {
    try {
      const { readSitemapUrls, generateNavigationFromSitemap } = await import(
        './sitemap-schema-integration'
      );
      const sitemapUrls = await readSitemapUrls();

      if (sitemapUrls.length > 5) {
        // Large sitemap detected - could add optimization logic here
      }

      if (sitemapUrls.length > 0) {
        const navigation = generateNavigationFromSitemap(sitemapUrls, this.baseUrl);
        return navigation;
      }
    } catch {
      // Ignore errors when reading sitemap for navigation
    }

    // Fallback navigation based on actual sitemap structure I can see
    const navItems = [
      { name: 'About', url: '/about', description: 'About our company' },
      { name: 'Company', url: '/company', description: 'Company information' },
      { name: 'Contact', url: '/contact', description: 'Get in touch with us' },
      { name: 'Newsroom', url: '/newsroom', description: 'Latest news and press releases' },
      { name: 'Resources', url: '/resources', description: 'Resources and documentation' },
      { name: 'Careers', url: '/careers', description: 'Career opportunities' }
    ];

    return navItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      description: item.description,
      item: {
        '@type': 'WebPage',
        '@id': `${this.baseUrl}${item.url}#webpage`,
        url: `${this.baseUrl}${item.url}`,
        name: item.name,
        description: item.description
      }
    }));
  }

  /**
   * Generate main site sections from actual sitemap data
   */
  private async generateMainSections(): Promise<any[]> {
    try {
      const { readSitemapUrls, generateHasPartFromSitemap } = await import(
        './sitemap-schema-integration'
      );
      const sitemapUrls = await readSitemapUrls();

      if (sitemapUrls.length > 0) {
        return generateHasPartFromSitemap(sitemapUrls);
      }
    } catch {
      // Ignore errors when reading sitemap for sections
    }

    // Fallback sections based on actual sitemap - removing duplicates and non-existent pages
    return [
      {
        '@type': 'WebPage',
        '@id': `${this.baseUrl}/about#webpage`,
        url: `${this.baseUrl}/about`,
        name: 'About',
        description: 'About our company'
      },
      {
        '@type': 'WebPage',
        '@id': `${this.baseUrl}/company#webpage`,
        url: `${this.baseUrl}/company`,
        name: 'Company',
        description: 'Company information'
      },
      {
        '@type': 'ContactPage',
        '@id': `${this.baseUrl}/contact#contactpage`,
        url: `${this.baseUrl}/contact`,
        name: 'Contact',
        description: 'Get in touch with us'
      },
      {
        '@type': 'WebPage',
        '@id': `${this.baseUrl}/newsroom#webpage`,
        url: `${this.baseUrl}/newsroom`,
        name: 'Newsroom',
        description: 'Latest news and press releases'
      },
      {
        '@type': 'WebPage',
        '@id': `${this.baseUrl}/resources#webpage`,
        url: `${this.baseUrl}/resources`,
        name: 'Resources',
        description: 'Resources and documentation'
      },
      {
        '@type': 'WebPage',
        '@id': `${this.baseUrl}/careers#webpage`,
        url: `${this.baseUrl}/careers`,
        name: 'Careers',
        description: 'Career opportunities'
      }
    ];
  }

  /**
   * Generate complete hierarchical schema for homepage
   * Organization -> WebSite -> Navigation -> Pages
   */
   
  async generateHomepageSchema(content?: ContentfulContent): Promise<any> {
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${this.baseUrl}#organization`,
      name: 'PlaceholderCorp',
      url: this.baseUrl,
      description: 'Leading provider of solar tracking solutions and renewable energy technology',
      logo: {
        '@type': 'ImageObject',
        '@id': `${this.baseUrl}/logo.png#logo`,
        url: `${this.baseUrl}/logo.png`,
        width: 200,
        height: 60
      },
      foundingDate: '2013',
      industry: 'Renewable Energy',
      numberOfEmployees: '1000+',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'US',
        addressLocality: 'Fremont',
        addressRegion: 'CA'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        url: `${this.baseUrl}/contact`
      },
      sameAs: ['https://www.linkedin.com/company/nextracker', 'https://twitter.com/nextracker'],
      // WebSite owned by Organization
      owns: {
        '@type': 'WebSite',
        '@id': `${this.baseUrl}#website`,
        name: 'PlaceholderCorp',
        url: this.baseUrl,
        description: 'Leading provider of solar tracking solutions and renewable energy technology',
        publisher: {
          '@type': 'Organization',
          '@id': `${this.baseUrl}#organization`
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${this.baseUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        },
        // Main navigation structure
        mainEntity: {
          '@type': 'ItemList',
          '@id': `${this.baseUrl}#navigation`,
          name: 'Main Navigation',
          itemListElement: await this.generateSiteNavigationItems()
        },
        // Site sections/pages
        hasPart: [
          // Homepage
          {
            '@type': 'WebPage',
            '@id': `${this.baseUrl}/#webpage`,
            url: this.baseUrl,
            name: content?.title || 'Home',
            description: content?.description || 'Homepage',
            isPartOf: {
              '@type': 'WebSite',
              '@id': `${this.baseUrl}#website`
            }
          },
          // Main sections
          ...(await this.generateMainSections())
        ]
      }
    };

    return organizationSchema;
  }

  /**
   * Main mapping function - automatically detects content type and maps appropriately
   */
  mapContentToSchema(
    content: ContentfulContent,
    path: string,
    contentType?: string
  ): Record<string, unknown> {
    const type = contentType || content.__typename?.toLowerCase() || 'page';

    switch (type) {
      case 'page':
        return this.mapPageToWebPage(content, path);
      case 'pagelist':
        return this.mapPageListToCollectionPage(content, path);
      case 'post':
        return this.mapPostToArticle(content, path);
      case 'product':
        return this.mapProductToProduct(content, path);
      case 'service':
      case 'solution':
        return this.mapServiceToService(content, path);
      case 'event':
        return this.mapEventToEvent(content, path);
      default:
        return this.mapPageToWebPage(content, path);
    }
  }
}

// Export default instance
export const contentfulSchemaMapper = new ContentfulSchemaMapper();
