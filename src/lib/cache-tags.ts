/**
 * Cache tag utilities for ISR and revalidation
 */

/**
 * Generate cache tags for content based on type and identifiers
 */
export function generateCacheTags(
  contentType: string,
  identifiers: {
    id?: string;
    slug?: string;
    parentIds?: string[];
  }
): string[] {
  const tags: string[] = [];

  // Content type tag
  tags.push(`contentType:${contentType}`);

  // Entry-specific tags
  if (identifiers.id) {
    tags.push(`entry:${identifiers.id}`);
  }

  if (identifiers.slug) {
    tags.push(`slug:${identifiers.slug}`);
  }

  // Parent relationship tags
  if (identifiers.parentIds) {
    identifiers.parentIds.forEach(parentId => {
      tags.push(`parent:${parentId}`);
    });
  }

  // Global layout tags for critical content
  if (['Header', 'Footer', 'PageLayout'].includes(contentType)) {
    tags.push('global-layout');
  }

  return tags;
}

/**
 * Get cache configuration for different content types
 */
export function getCacheConfig(
  contentType: string,
  identifiers: {
    id?: string;
    slug?: string;
    parentIds?: string[];
  },
  customRevalidate?: number
) {
  const tags = generateCacheTags(contentType, identifiers);
  
  // Different revalidation times based on content type
  let revalidate = customRevalidate;
  
  if (!revalidate) {
    switch (contentType) {
      case 'Header':
      case 'Footer':
      case 'PageLayout':
        revalidate = 86400; // 24 hours for layout components
        break;
      case 'Page':
      case 'PageList':
        revalidate = 3600; // 1 hour for pages
        break;
      case 'Product':
      case 'Service':
      case 'Solution':
        revalidate = 1800; // 30 minutes for product content
        break;
      case 'Post':
        revalidate = 900; // 15 minutes for blog posts
        break;
      default:
        revalidate = 3600; // 1 hour default
    }
  }

  return {
    next: {
      revalidate,
      tags
    }
  };
}
