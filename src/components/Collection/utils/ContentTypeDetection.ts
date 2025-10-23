/**
 * Utility functions for detecting content types based on item properties
 */

export type ContentType = 'Page' | 'PageList' | 'Post' | 'Product' | 'Solution' | 'Service';

/**
 * Determines the content type of an item based on its properties
 * @param item - The content item to analyze
 * @returns The detected content type
 */
export function detectContentType(item: Record<string, unknown>): ContentType {
  // Check for unique properties that identify each content type
  if ('categories' in item) return 'Post';
  if ('pagesCollection' in item) return 'PageList';
  if ('icon' in item || 'tags' in item) return 'Product';
  if ('backgroundImage' in item && 'variant' in item) return 'Solution';
  if ('cardImage' in item || 'cardTitle' in item) return 'Service';
  return 'Page'; // Default fallback
}

/**
 * Gets the appropriate image source for a content type
 * @param item - The content item
 * @param contentType - The content type
 * @returns The image source or null
 */
export function getImageSourceForContentType(
  item: Record<string, unknown>,
  contentType: ContentType
): unknown {
  switch (contentType) {
    case 'Page':
      return item?.openGraphImage;
    case 'PageList':
      return null; // PageLists typically don't have images
    case 'Post':
      return item?.mainImage;
    case 'Product':
      return item?.image ?? item?.icon;
    case 'Solution':
      return item?.backgroundImage;
    case 'Service':
      return item?.cardImage;
    default:
      return null;
  }
}

/**
 * Gets the appropriate URL path for a content type
 * @param item - The content item
 * @param contentType - The content type
 * @returns The URL path
 */
export function getUrlForContentType(
  item: Record<string, unknown>,
  contentType: ContentType
): string {
  switch (contentType) {
    case 'Page':
    case 'PageList':
      return `/${String(item.slug)}`;
    case 'Post':
      return `/blog/${String(item.slug)}`;
    case 'Product':
      return `/products/${String(item.slug)}`;
    case 'Solution':
      return `/solutions/${String(item.slug)}`;
    case 'Service':
      return `/services/${String(item.slug)}`;
    default:
      return `/${String(item.slug)}`;
  }
}
