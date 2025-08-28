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
      'openGraphImage' in obj)
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
