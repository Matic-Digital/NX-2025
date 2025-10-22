/**
 * Schema.org JSON-LD Generator
 * 
 * Generates structured data for different content types using the SEO fields
 * to enhance search engine understanding and enable rich snippets
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-require-imports */

import { extractSEOTitle, extractSEODescription, extractOpenGraphImage } from './metadata-utils';
import { debugSchema } from './schema-validator';

// Base schema interfaces
interface BaseSchema {
  '@context': string;
  '@type': string;
  name: string;
  description?: string;
  url?: string;
  image?: string | ImageObject;
}

interface ImageObject {
  '@type': 'ImageObject';
  url: string;
  width?: number;
  height?: number;
}

interface OrganizationSchema extends BaseSchema {
  '@type': 'Organization';
  logo?: string | ImageObject;
  sameAs?: string[];
  foundingDate?: string;
  industry?: string;
  numberOfEmployees?: string;
  address?: PostalAddress;
  contactPoint?: ContactPoint;
}

interface PostalAddress {
  '@type': 'PostalAddress';
  addressCountry?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  streetAddress?: string;
}

interface ContactPoint {
  '@type': 'ContactPoint';
  contactType: string;
  url?: string;
  telephone?: string;
  email?: string;
}

interface WebPageSchema extends BaseSchema {
  '@type': 'WebPage';
  mainEntity?: any;
  breadcrumb?: BreadcrumbList;
  isPartOf?: WebSite;
}

interface ArticleSchema extends BaseSchema {
  '@type': 'Article';
  headline: string;
  datePublished?: string;
  dateModified?: string;
  author?: Person | Organization;
  publisher?: Organization;
  mainEntityOfPage?: WebPage;
}

interface ProductSchema extends BaseSchema {
  '@type': 'Product';
  brand?: Organization;
  manufacturer?: Organization;
  category?: string;
  offers?: Offer;
}

interface ServiceSchema extends BaseSchema {
  '@type': 'Service';
  provider?: Organization;
  serviceType?: string;
  areaServed?: string;
}

interface EventSchema extends BaseSchema {
  '@type': 'Event';
  startDate?: string;
  endDate?: string;
  location?: Place;
  organizer?: Organization;
}

interface BreadcrumbList {
  '@type': 'BreadcrumbList';
  itemListElement: ListItem[];
}

interface ListItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: string;
}

interface WebSite {
  '@type': 'WebSite';
  name: string;
  url: string;
}

interface Person {
  '@type': 'Person';
  name: string;
}

interface Organization {
  '@type': 'Organization';
  name: string;
  url?: string;
  logo?: string | ImageObject;
}

interface Place {
  '@type': 'Place';
  name: string;
  address?: string;
}

interface Offer {
  '@type': 'Offer';
  availability?: string;
  price?: string;
  priceCurrency?: string;
}

interface WebPage {
  '@type': 'WebPage';
  url: string;
}

/**
 * Base schema generator class
 */
export class SchemaGenerator {
  private baseUrl: string;
  private organization: OrganizationSchema;

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
    
    this.organization = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'PlaceholderCorp',
      url: this.baseUrl,
      description: 'Leading provider of solar tracking solutions and renewable energy technology',
      logo: {
        '@type': 'ImageObject',
        url: `${this.baseUrl}/logo.png`, // Update with actual logo path
        width: 200,
        height: 60
      },
      foundingDate: '2013', // Add actual founding date
      industry: 'Renewable Energy',
      numberOfEmployees: '1000+', // Add actual number or range
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'US',
        addressLocality: 'Fremont',
        addressRegion: 'CA'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        url: this.baseUrl + '/contact'
      },
      sameAs: [
        // Add social media URLs
        'https://www.linkedin.com/company/nextracker',
        'https://twitter.com/nextracker'
      ]
    };
  }

  /**
   * Generate image object from content
   */
  private generateImageObject(content: any, fallbackTitle: string): ImageObject | string | undefined {
    const openGraphImage = extractOpenGraphImage(content, this.baseUrl, fallbackTitle);
    
    if (openGraphImage) {
      return {
        '@type': 'ImageObject',
        url: openGraphImage.url,
        width: openGraphImage.width,
        height: openGraphImage.height
      };
    }
    
    return undefined;
  }

  /**
   * Generate breadcrumb schema
   */
  private generateBreadcrumb(path: string): BreadcrumbList {
    const segments = path.split('/').filter(Boolean);
    const items: ListItem[] = [
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
      itemListElement: items
    };
  }

  /**
   * Generate WebPage schema
   */
  generateWebPageSchema(content: any, path: string): WebPageSchema {
    const title = extractSEOTitle(content, 'Nextracker');
    const description = extractSEODescription(content, '');
    const url = `${this.baseUrl}${path}`;

    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description: description || undefined,
      url,
      image: this.generateImageObject(content, title),
      breadcrumb: this.generateBreadcrumb(path),
      isPartOf: {
        '@type': 'WebSite',
        name: 'Nextracker',
        url: this.baseUrl
      }
    };
  }

  /**
   * Generate Article schema (for Posts)
   */
  generateArticleSchema(content: any, path: string): ArticleSchema {
    const title = extractSEOTitle(content, 'Nextracker Article');
    const description = extractSEODescription(content, '');
    const url = `${this.baseUrl}${path}`;

    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      name: title,
      headline: title,
      description: description || undefined,
      url,
      image: this.generateImageObject(content, title),
      datePublished: (content as any)?.datePublished || (content as any)?.sys?.firstPublishedAt,
      dateModified: (content as any)?.dateModified || (content as any)?.sys?.publishedAt,
      author: {
        '@type': 'Organization',
        name: 'Nextracker'
      },
      publisher: this.organization,
      mainEntityOfPage: {
        '@type': 'WebPage',
        url
      }
    };
  }

  /**
   * Generate Product schema
   */
  generateProductSchema(content: any, path: string): ProductSchema {
    const title = extractSEOTitle(content, 'Nextracker Product');
    const description = extractSEODescription(content, '');
    const url = `${this.baseUrl}${path}`;

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: title,
      description: description || undefined,
      url,
      image: this.generateImageObject(content, title),
      brand: this.organization,
      manufacturer: this.organization,
      category: 'Solar Tracking Systems'
    };
  }

  /**
   * Generate Service schema
   */
  generateServiceSchema(content: any, path: string): ServiceSchema {
    const title = extractSEOTitle(content, 'Nextracker Service');
    const description = extractSEODescription(content, '');
    const url = `${this.baseUrl}${path}`;

    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: title,
      description: description || undefined,
      url,
      image: this.generateImageObject(content, title),
      provider: this.organization,
      serviceType: 'Solar Energy Services'
    };
  }

  /**
   * Generate Event schema
   */
  generateEventSchema(content: any, path: string): EventSchema {
    const title = extractSEOTitle(content, 'Nextracker Event');
    const description = extractSEODescription(content, '');
    const url = `${this.baseUrl}${path}`;

    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: title,
      description: description || undefined,
      url,
      image: this.generateImageObject(content, title),
      startDate: (content as any)?.dateTime,
      endDate: (content as any)?.endDateTime,
      organizer: this.organization,
      location: (content as any)?.address ? {
        '@type': 'Place',
        name: (content as any)?.address,
        address: (content as any)?.address
      } : undefined
    };
  }

  /**
   * Generate Organization schema
   */
  generateOrganizationSchema(): OrganizationSchema {
    return {
      ...this.organization,
      // Ensure all required fields are present
      url: this.baseUrl,
      name: 'Nextracker',
      '@context': 'https://schema.org',
      '@type': 'Organization'
    };
  }

  /**
   * Generate WebSite schema with search action
   */
  generateWebSiteSchema(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Nextracker',
      url: this.baseUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${this.baseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
  }

  /**
   * Generate appropriate schema based on content type
   */
  generateSchemaForContentType(
    contentType: 'page' | 'pageList' | 'post' | 'product' | 'service' | 'solution' | 'event',
    content: any,
    path: string
  ): any {
    let schema;
    
    switch (contentType) {
      case 'post':
        schema = this.generateArticleSchema(content, path);
        break;
      case 'product':
        schema = this.generateProductSchema(content, path);
        break;
      case 'service':
      case 'solution':
        schema = this.generateServiceSchema(content, path);
        break;
      case 'event':
        schema = this.generateEventSchema(content, path);
        break;
      case 'page':
      case 'pageList':
      default:
        schema = this.generateWebPageSchema(content, path);
    }
    
    // Validate schema in development
    debugSchema(schema, schema['@type']);
    
    return schema;
  }

  /**
   * Convert schema object to JSON-LD string for HTML head
   */
  toJsonLd(schema: any): string {
    return JSON.stringify(schema, null, 0);
  }
}

/**
 * Default schema generator instance
 */
export const schemaGenerator = new SchemaGenerator();

/**
 * Helper function to generate schema for a given content type and content
 */
export function generateSchema(
  contentType: 'page' | 'pageList' | 'post' | 'product' | 'service' | 'solution' | 'event',
  content: any,
  path: string
): string {
  return schemaGenerator.toJsonLd(
    schemaGenerator.generateSchemaForContentType(contentType, content, path)
  );
}

/**
 * Enhanced schema generation using Contentful structure mapping
 */
export function generateContentfulSchema(
  content: any,
  path: string,
  contentType?: string
): string {
  const { contentfulSchemaMapper } = require('./contentful-schema-mapper');
  return JSON.stringify(
    contentfulSchemaMapper.mapContentToSchema(content, path, contentType),
    null,
    0
  );
}

/**
 * Generate multiple schemas (useful for complex pages)
 */
export function generateMultipleSchemas(schemas: any[]): string {
  return JSON.stringify(schemas, null, 0);
}
