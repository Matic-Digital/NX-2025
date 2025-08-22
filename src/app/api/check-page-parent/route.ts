import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getAllPageLists } from '@/lib/contentful-api/page-list';
import type { PageList } from '@/types/contentful/PageList';

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
    console.warn(`buildRoutingPath: Maximum depth reached for itemId: ${itemId}`);
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
      const itemSlug = 'slug' in item ? item.slug : 'link' in item ? item.link : undefined;
      return (itemSlug === itemId) || (item.sys?.id === itemId);
    });

    if (containsItem && pageList.slug) {
      // Mark this PageList as visited to prevent infinite recursion
      const newVisited = new Set(visited);
      newVisited.add(pageList.sys.id);

      // Recursively find if this PageList is nested within another PageList
      // This builds the complete parent chain (e.g., products > trackers)
      const parentPath = buildRoutingPath(pageList.sys.id, pageLists, newVisited, depth + 1);

      // Return the full routing path: parent path + current PageList slug
      return [...parentPath, pageList.slug];
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
  console.log('API: Checking page parent with nested routing support');

  // Get the slug from the query parameters
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  // If no slug is provided, return an error
  if (!slug) {
    return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
  }

  try {
    console.log(`API: Checking routing path for item with slug '${slug}'`);

    // Get all page lists
    const pageListsResponse = await getAllPageLists(false);
    const pageLists = pageListsResponse.items;

    if (!pageLists.length) {
      console.log('API: No page lists found in the system');
      return NextResponse.json({
        parentPath: [],
        parentSlug: null,
        fullPath: slug
      });
    }

    console.log(`API: Found ${pageLists.length} page lists to search`);

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
      console.log(`API: Found PageList '${slug}' with ID '${targetItemId}'`);

      // Debug: Show all PageLists and their pagesCollection to see nesting
      console.log('API: All PageLists and their contents:');
      pageLists.forEach((pl) => {
        console.log(
          `  - PageList "${pl.slug}" (${pl.title}) contains:`,
          pl.pagesCollection?.items?.map((item) => {
            const itemSlug = hasSlug(item)
              ? item.slug
              : ((item as { link?: string })?.link ?? 'no-slug');
            return `${itemSlug} (${item?.__typename})`;
          }) ?? 'no items'
        );
      });

      // Special debug for products PageList
      const productsPageList = pageLists.find((pl) => pl.slug === 'products');
      if (productsPageList) {
        console.log('API: Products PageList detailed contents:');
        productsPageList.pagesCollection?.items?.forEach((item, index) => {
          const itemSlug = hasSlug(item)
            ? item.slug
            : ((item as { link?: string })?.link ?? 'no-slug');
          console.log(`  [${index}] ${itemSlug} (${item?.__typename}) - ID: ${item?.sys?.id}`);
        });
      }
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
          console.log(
            `API: Found item '${slug}' with ID '${targetItemId}' in PageList '${pageList.title}'`
          );
          break;
        }
      }
    }

    // If item not found, return null
    if (!targetItemId || !targetItem) {
      console.log(`API: No item found with slug '${slug}'`);
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

      console.log(`API: Item '${slug}' has routing path: ${fullPath}`);
      console.log(`API: Parent path: [${parentPath.join(', ')}]`);

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
      console.log(`API: Item '${slug}' is not nested within any PageList`);
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
  } catch (error) {
    console.error('Error checking page parent:', error);
    return NextResponse.json({ error: 'Error checking page parent' }, { status: 500 });
  }
}
