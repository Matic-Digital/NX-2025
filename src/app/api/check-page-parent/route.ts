import { NextResponse } from 'next/server';

import { getAllPageLists } from '@/components/PageList/PageListApi';

import type { PageList } from '@/components/PageList/PageListSchema';
import type { NextRequest } from 'next/server';

/**
 * Type guard to check if an item has a slug property
 * Used in PageList nesting validation to identify content items with slugs
 */
function hasSlug(
  item: unknown
): item is { sys: { id: string }; slug: string; title?: string; __typename?: string } {
  return (
    item !== null &&
    typeof item === 'object' &&
    'slug' in item &&
    typeof (item as { slug?: string }).slug === 'string'
  );
}

/**
 * Type guard to check if an item is an ExternalPage (has link instead of slug)
 */
const _isExternalPage = (
  item: unknown
): item is { sys: { id: string }; link: string; title?: string; __typename?: string } => {
  const linkSlug = (item as { link?: string }).link ?? (item as string);
  const slug = linkSlug;
  return slug !== undefined;
};

/**
 * Builds the full routing path for nested page lists
 *
 * This function implements the core PageList nesting detection algorithm:
 * 1. Searches through all PageLists to find which one contains the target item
 * 2. Recursively builds the parent chain by finding PageLists that contain other PageLists
 * 3. Returns the complete routing path from root to the target item
 *
 * Example: For item "nx-horizon" nested as products > trackers > nx-horizon
 * Returns: ["products", "trackers"]
 *
 * @param itemId - The ID of the item to find the path for
 * @param pageLists - All page lists to search through
 * @param visited - Set of visited page list IDs to prevent infinite loops
 * @returns Array of slugs representing the path from root to item
 */
function buildRoutingPath(
  itemId: string,
  pageLists: PageList[],
  visited = new Set<string>(),
  depth = 0
): string[] {
  // Prevent infinite recursion with depth limit
  if (depth > 10) {
    return [];
  }

  // Find the page list that contains this item
  // Search through all PageLists to find which one contains the target item
  for (const pageList of pageLists) {
    if (visited.has(pageList.sys.id)) {
      continue; // Skip already visited to prevent infinite loops in circular references
    }

    // Check if this PageList contains the target item in its pagesCollection
    const containsItem = pageList.pagesCollection?.items?.some((item) => {
      if (!item) return false; // Skip null items
      const itemSlug = 'slug' in item ? item.slug : 'link' in item ? item.link : undefined;
      // Check both slug and ID matches, and also check if itemId is a PageList slug that matches this item's slug
      return itemSlug === itemId || item.sys?.id === itemId;
    });

    if (containsItem && pageList.slug) {
      // Mark this PageList as visited to prevent infinite recursion
      const newVisited = new Set(visited);
      newVisited.add(pageList.sys.id);

      // Recursively find if this PageList is nested within another PageList
      // This builds the complete parent chain (e.g., products > trackers)
      // Use the PageList's slug for the recursive search, not its ID
      const parentPath = buildRoutingPath(pageList.slug, pageLists, newVisited, depth + 1);

      // Return the full routing path: parent path + current PageList slug
      const fullPath = [...parentPath, pageList.slug];
      return fullPath;
    }
  }

  return []; // Item not found in any page list
}

/**
 * API route to check if a page belongs to a PageList and return the full routing path
 *
 * This endpoint is critical for the PageList nesting system. It's used by components
 * like ContentGridItem, CtaBanner, and CtaGrid to determine the correct nested URL
 * structure for internal links, ensuring all navigation respects the PageList hierarchy.
 *
 * Key functionality:
 * - Detects if a content item or PageList has parent PageLists
 * - Returns the complete routing path for proper nested URL construction
 * - Prevents orphaned content from being accessible via incorrect URLs
 * - Supports multi-level nesting (e.g., products > trackers > specific-product)
 *
 * Example usage:
 * GET /api/check-page-parent?slug=nx-horizon
 * Returns: { parentPath: ["products", "trackers"], fullPath: "products/trackers/nx-horizon" }
 *
 * @param request - The incoming request with query parameters
 * @returns JSON response with parentPath array and parentSlug string
 */
export async function GET(request: NextRequest) {
  // Get the slug from the query parameters
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  // If no slug is provided, return an error
  if (!slug) {
    return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
  }

  try {
    // Get all page lists
    const pageListsResponse = await getAllPageLists(false);
    const pageLists = pageListsResponse.items;

    if (!pageLists.length) {
      return NextResponse.json({
        parentPath: [],
        parentSlug: null,
        fullPath: slug
      });
    }

    // First, check if the slug itself is a PageList
    let targetItemId: string | null = null;
    let targetItem: {
      sys: { id: string };
      slug?: string;
      title?: string;
      __typename?: string;
    } | null = null;

    // Check if slug matches a PageList directly
    const targetPageList = pageLists.find((pageList) => pageList.slug === slug);
    if (targetPageList) {
      targetItemId = targetPageList.sys.id;
      targetItem = targetPageList;
    } else {
      // If not a PageList, search within PageLists' pagesCollection
      for (const pageList of pageLists) {
        if (!pageList.pagesCollection?.items?.length) continue;

        const foundItem = pageList.pagesCollection.items.find(
          (item) => hasSlug(item) && item.slug === slug
        );

        if (foundItem && hasSlug(foundItem)) {
          targetItemId = foundItem.sys.id;
          targetItem = foundItem;
          break;
        }
      }
    }

    // If item not found, return null
    if (!targetItemId || !targetItem) {
      return NextResponse.json({
        parentPath: [],
        parentSlug: null,
        fullPath: slug
      });
    }

    // Build the full routing path
    const parentPath = buildRoutingPath(targetItemId, pageLists);

    if (parentPath.length > 0) {
      const parentSlug = parentPath[parentPath.length - 1]; // Last element is direct parent
      const fullPath = [...parentPath, slug].join('/');

      // Find the parent PageList object
      const parentPageList = pageLists.find((pl) => pl.slug === parentSlug);

      return NextResponse.json({
        parentPath,
        parentSlug,
        fullPath,
        itemId: targetItemId,
        itemName: targetItem.title,
        itemType: targetItem.__typename,
        parentPageList: parentPageList
          ? { slug: parentPageList.slug, title: parentPageList.title }
          : null
      });
    } else {
      return NextResponse.json({
        parentPath: [],
        parentSlug: null,
        fullPath: slug,
        itemId: targetItemId,
        itemName: targetItem.title,
        itemType: targetItem.__typename,
        parentPageList: null
      });
    }
  } catch {
    return NextResponse.json({ error: 'Error checking page parent' }, { status: 500 });
  }
}
