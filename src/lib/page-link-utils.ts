import { staticRoutingService } from '@/lib/static-routing';

interface InternalLink {
  sys: {
    id: string;
  };
  slug: string;
}

interface LinkItem {
  sys: {
    id: string;
  };
  internalLink?: InternalLink;
  externalLink?: string;
}

/**
 * Resolves URLs for items with internal/external links by checking for PageList nesting
 * @param items - Array of items that have CTA or link properties
 * @param getLinkFromItem - Function to extract the link object from each item
 * @returns Promise<Record<string, string>> - Map of item IDs to resolved URLs
 */
export async function resolveNestedUrls<T>(
  items: T[],
  getLinkFromItem: (item: T) => LinkItem | undefined
): Promise<Record<string, string>> {
  const urlMap: Record<string, string> = {};

  // Process each item to determine its correct nested URL structure
  for (const item of items) {
    const linkItem = getLinkFromItem(item);

    if (linkItem?.internalLink?.slug) {
      // Use static routing service to get route metadata (replaces API call)
      const routeMetadata = staticRoutingService.getRoute(`/${linkItem.internalLink.slug}`);
      
      if (routeMetadata && routeMetadata.isNested && routeMetadata.parentPageLists.length > 0) {
        // Use full nested path when parent PageLists are detected
        // e.g., /products/trackers/nx-horizon instead of /nx-horizon
        urlMap[linkItem.internalLink.sys.id] = routeMetadata.path;
      } else {
        // Fallback to flat URL structure when no nesting is detected
        urlMap[linkItem.internalLink.sys.id] = `/${linkItem.internalLink.slug}`;
      }
    } else if (linkItem?.externalLink) {
      // External links remain unchanged
      urlMap[linkItem.sys.id] = linkItem.externalLink;
    }
  }
  return urlMap;
}
