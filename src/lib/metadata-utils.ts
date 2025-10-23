/**
 * Utility functions for safe metadata extraction from Contentful data
 * These functions provide type-safe access to SEO fields while avoiding TypeScript/ESLint errors
 */

// Type definitions for metadata extraction
export interface ContentfulImage {
  link?: string;
  title?: string;
  altText?: string;
  sys?: { id: string };
}

export interface ContentfulPageSEO {
  title?: string;
  seoTitle?: string;
  seoDescription?: string;
  description?: string;
  openGraphImage?: ContentfulImage;
  openGraphTitle?: string;
  openGraphDescription?: string;
  canonicalUrl?: string;
  indexing?: boolean;
}

export interface OpenGraphImageResult {
  url: string;
  width: number;
  height: number;
  title?: string;
}

/**
 * Type guard to check if an object has the expected Contentful image structure
 */
function isContentfulImage(obj: unknown): obj is ContentfulImage {
  return (
    obj !== null && typeof obj === 'object' && ('link' in obj || 'title' in obj || 'altText' in obj)
  );
}

/**
 * Type guard to check if an object has SEO fields
 */
export function hasContentfulSEOFields(obj: unknown): obj is ContentfulPageSEO {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    ('title' in obj ||
      'seoTitle' in obj ||
      'seoDescription' in obj ||
      'description' in obj ||
      'openGraphImage' in obj ||
      'openGraphTitle' in obj ||
      'openGraphDescription' in obj ||
      'canonicalUrl' in obj ||
      'indexing' in obj)
  );
}

/**
 * Safely extracts image URL from Contentful image object
 */
export function extractImageUrl(image: unknown, baseUrl: string): string | undefined {
  if (!isContentfulImage(image)) return undefined;

  if (!image.link || typeof image.link !== 'string') return undefined;

  return image.link.startsWith('http') ? image.link : `${baseUrl}${image.link}`;
}

/**
 * Safely extracts image alt text from Contentful image object
 */
export function extractImageAlt(image: unknown, fallback: string): string {
  if (!isContentfulImage(image)) return fallback;

  if (image.altText && typeof image.altText === 'string') {
    return image.altText;
  }

  if (image.title && typeof image.title === 'string') {
    return image.title;
  }

  return fallback;
}

/**
 * Safely extracts Open Graph image data from Contentful page object
 */
export function extractOpenGraphImage(
  page: unknown,
  baseUrl: string,
  fallbackTitle: string
): OpenGraphImageResult | undefined {
  if (!hasContentfulSEOFields(page)) return undefined;

  const image = page.openGraphImage;
  if (!isContentfulImage(image)) return undefined;

  const url = extractImageUrl(image, baseUrl);
  if (!url) return undefined;

  const result: OpenGraphImageResult = {
    url,
    width: 1200,
    height: 630
  };

  const title = extractImageAlt(image, fallbackTitle);
  if (title !== fallbackTitle) {
    result.title = title;
  }

  return result;
}

/**
 * Safely extracts SEO title from Contentful page object
 */
export function extractSEOTitle(page: unknown, fallback: string): string {
  if (!hasContentfulSEOFields(page)) return fallback;

  if (page.seoTitle && typeof page.seoTitle === 'string') {
    return page.seoTitle;
  }

  if (page.title && typeof page.title === 'string') {
    return page.title;
  }

  return fallback;
}

/**
 * Safely extracts SEO description from Contentful page object
 */
export function extractSEODescription(page: unknown, fallback: string): string {
  if (!hasContentfulSEOFields(page)) return fallback;

  if (page.seoDescription && typeof page.seoDescription === 'string') {
    return page.seoDescription;
  }

  if (page.description && typeof page.description === 'string') {
    return page.description;
  }

  return fallback;
}

/**
 * Safely extracts Open Graph title from Contentful page object
 */
export function extractOpenGraphTitle(page: unknown, fallback: string): string {
  if (!hasContentfulSEOFields(page)) return fallback;

  if (page.openGraphTitle && typeof page.openGraphTitle === 'string') {
    return page.openGraphTitle;
  }

  // Fall back to SEO title, then regular title
  if (page.seoTitle && typeof page.seoTitle === 'string') {
    return page.seoTitle;
  }

  if (page.title && typeof page.title === 'string') {
    return page.title;
  }

  return fallback;
}

/**
 * Safely extracts Open Graph description from Contentful page object
 */
export function extractOpenGraphDescription(page: unknown, fallback: string): string {
  if (!hasContentfulSEOFields(page)) return fallback;

  if (page.openGraphDescription && typeof page.openGraphDescription === 'string') {
    return page.openGraphDescription;
  }

  // Fall back to SEO description, then regular description
  if (page.seoDescription && typeof page.seoDescription === 'string') {
    return page.seoDescription;
  }

  if (page.description && typeof page.description === 'string') {
    return page.description;
  }

  return fallback;
}

/**
 * Safely extracts canonical URL from Contentful page object
 */
export function extractCanonicalUrl(page: unknown): string | undefined {
  if (!hasContentfulSEOFields(page)) return undefined;

  if (page.canonicalUrl && typeof page.canonicalUrl === 'string') {
    return page.canonicalUrl;
  }

  return undefined;
}

/**
 * Safely extracts indexing preference from Contentful page object
 */
export function extractIndexing(page: unknown, defaultValue = true): boolean {
  if (!hasContentfulSEOFields(page)) return defaultValue;

  if (typeof page.indexing === 'boolean') {
    return page.indexing;
  }

  return defaultValue;
}
