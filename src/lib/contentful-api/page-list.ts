import { fetchGraphQL } from '../api';

import type { PageList, PageListResponse, PageListWithRefs } from '@/types/contentful/PageList';
import { ContentfulError, NetworkError } from '../errors';
import { EXTERNAL_PAGE_FIELDS } from './external-page';

import { getHeaderById } from './header';
import { getFooterById } from './footer';

import { BANNERHERO_GRAPHQL_FIELDS } from './banner-hero';
import { CTABANNER_GRAPHQL_FIELDS } from './cta-banner';
import { CONTENTGRID_GRAPHQL_FIELDS } from './content-grid';
import { IMAGEBETWEEN_GRAPHQL_FIELDS } from './image-between';
import { SYS_FIELDS } from './constants';

// Inline PAGE_BASIC_FIELDS to avoid circular dependency
const PAGE_BASIC_FIELDS = `
  ${SYS_FIELDS}
  title
  slug
  description
`;

export const PAGELIST_BASIC_FIELDS = `
  ${SYS_FIELDS}
  title
  slug
`;

// Minimal PageList fields for initial fetch
export const PAGELIST_MINIMAL_FIELDS = `
  ${PAGELIST_BASIC_FIELDS}
  pagesCollection(limit: 10) {
    items {
      ... on Page {
        ${PAGE_BASIC_FIELDS}
      }
      ... on ExternalPage {
        ${EXTERNAL_PAGE_FIELDS}
      }
    }
  }
`;

// PageList fields with header/footer references only (no full data)
export const PAGELIST_WITH_REFS_FIELDS = `
  ${PAGELIST_MINIMAL_FIELDS}
  header {
    sys {
      id
    }
    __typename
  }
  footer {
    sys {
      id
    }
    __typename
  }
`;

// Simplified PageList fields for listing and reference checks
export const PAGELIST_SIMPLIFIED_FIELDS = `
  ${PAGELIST_BASIC_FIELDS}
  pagesCollection(limit: 20) {
    items {
      ... on Page {
        ${PAGE_BASIC_FIELDS}
      }
      ... on ExternalPage {
        ${EXTERNAL_PAGE_FIELDS}
      }
    }
  }
`;

/**
 * Checks if a page belongs to any PageList and returns the first PageList it belongs to
 * @param pageId - The ID of the page to check
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the PageList or null if not found
 */
export async function checkPageBelongsToPageList(
  pageId: string,
  preview = true
): Promise<PageList | null> {
  try {
    console.log(`Checking if page with ID '${pageId}' belongs to any PageList`);

    // Fetch all PageLists
    const pageLists = await getAllPageLists(preview);

    if (!pageLists.items.length) {
      console.log('No PageLists found in the system');
      return null;
    }

    console.log(`Found ${pageLists.items.length} PageLists to check`);

    // Check each PageList to see if the page belongs to it
    for (const pageList of pageLists.items) {
      console.log(`Checking PageList: ${pageList.title} (${pageList.slug})`);

      if (!pageList.pagesCollection?.items.length) {
        console.log(`PageList ${pageList.title} has no pages`);
        continue;
      }

      console.log(`PageList ${pageList.title} has ${pageList.pagesCollection.items.length} pages`);

      // Log all page IDs in this PageList for debugging
      const pageIds = pageList.pagesCollection.items.map((item) => item.sys.id);
      console.log(`Page IDs in PageList ${pageList.title}:`, pageIds);

      const pageInList = pageList.pagesCollection.items.some((item) => item.sys.id === pageId);

      if (pageInList) {
        console.log(
          `Page with ID '${pageId}' belongs to PageList '${pageList.title}' (${pageList.slug})`
        );
        return pageList;
      }
    }

    console.log(`Page with ID '${pageId}' does not belong to any PageList`);
    return null;
  } catch (error) {
    if (error instanceof Error) {
      throw new NetworkError(`Error checking if page belongs to any PageList: ${error.message}`);
    }
    throw new Error('Unknown error checking if page belongs to any PageList');
  }
}

// Note: getPageBySlugInPageList function removed to avoid circular dependency
// This function would require importing getPageBySlug from './page' which creates a circular dependency

/**
 * Fetches all page lists from Contentful
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to page lists response
 */
export async function getAllPageLists(preview = false): Promise<PageListResponse> {
  try {
    // Use simplified fields to reduce query complexity
    const response = await fetchGraphQL<PageList>(
      `query GetAllPageLists($preview: Boolean!) {
        pageListCollection(preview: $preview) {
          items {
            ${PAGELIST_SIMPLIFIED_FIELDS}
          }
          total
        }
      }`,
      { preview },
      preview
    );

    if (!response.data?.pageListCollection) {
      throw new ContentfulError('Failed to fetch page lists from Contentful');
    }

    return {
      items: response.data.pageListCollection.items,
      total: response.data.pageListCollection.total
    };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching page lists: ${error.message}`);
    }
    throw new Error('Unknown error fetching page lists');
  }
}

/**
 * Fetches a single page list by slug
 * @param slug - The slug of the page list to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the page list or null if not found
 */
export async function getPageListBySlug(slug: string, preview = false): Promise<PageList | null> {
  try {
    // Log the request for debugging
    console.log(`Fetching PageList with slug: ${slug}, preview: ${preview}`);

    // First, fetch the basic PageList data with references
    const response = await fetchGraphQL<PageListWithRefs>(
      `query GetPageListBySlug($slug: String!, $preview: Boolean!) {
        pageListCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
          items {
            ${PAGELIST_WITH_REFS_FIELDS}
          }
        }
      }`,
      { slug, preview },
      preview
    );

    // Check if we have any results
    if (!response.data?.pageListCollection?.items?.length) {
      console.log(`No PageList found with slug: ${slug}`);
      return null;
    }

    console.log(`Successfully fetched PageList with slug: ${slug}`);

    const pageListData = response.data.pageListCollection.items[0]!;

    // Fetch header data if referenced
    let header = null;
    if (pageListData.header?.sys?.id) {
      header = await getHeaderById(pageListData.header.sys.id, preview);
    }

    // Fetch footer data if referenced
    let footer = null;
    if (pageListData.footer?.sys?.id) {
      footer = await getFooterById(pageListData.footer.sys.id, preview);
    }

    // Fetch page content separately
    const pageContentResponse = await fetchGraphQL(
      `query GetPageListContent($slug: String!, $preview: Boolean!) {
        pageListCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
          items {
            pageContentCollection {
              items {
                ... on BannerHero {
                  ${BANNERHERO_GRAPHQL_FIELDS}
                }
                ... on ContentGrid {
                  ${CONTENTGRID_GRAPHQL_FIELDS}
                }
                ... on CtaBanner {
                  ${CTABANNER_GRAPHQL_FIELDS}
                }
                ... on ImageBetween {
                  ${IMAGEBETWEEN_GRAPHQL_FIELDS}
                }
              }
            }
          }
        }
      }`,
      { slug, preview },
      preview
    );

    // Safely extract page content with proper error checking
    let pageContent = null;
    try {
      const items = pageContentResponse.data?.pageListCollection?.items;
      if (items && items.length > 0 && items[0]) {
        // Type assertion is safe here since we know the GraphQL query structure
        const pageListItem = items[0] as { pageContentCollection?: { items: Array<unknown> } };
        pageContent = pageListItem.pageContentCollection ?? null;
      }
    } catch (error) {
      console.warn('Failed to extract page list content:', error);
      pageContent = null;
    }

    // Combine all the data
    const result = {
      ...pageListData,
      header,
      footer,
      pageContentCollection: pageContent
    } as PageList;

    // Debug the PageList structure
    console.log('PageList structure:', {
      title: result.title,
      slug: result.slug,
      hasHeader: !!result.header,
      hasFooter: !!result.footer,
      hasPageContent: !!result.pageContentCollection,
      pagesCount: result.pagesCollection?.items?.length ?? 0
    });

    return result;
  } catch (error) {
    console.error(`Error handling slug: ${slug}`, error);
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching page list by slug: ${error.message}`);
    }
    throw new Error('Unknown error fetching page list by slug');
  }
}
