import { fetchGraphQL } from '../api';
import type { Page, PageResponse, PageWithRefs } from '@/types/contentful/Page';
import { ContentfulError, NetworkError } from '../errors';
import { SYS_FIELDS } from './constants';
import { BANNERHERO_GRAPHQL_FIELDS } from './banner-hero';
import { CTABANNER_GRAPHQL_FIELDS } from './cta-banner';
import { CONTENTGRID_GRAPHQL_FIELDS } from './content-grid';
import { IMAGEBETWEEN_GRAPHQL_FIELDS } from './image-between';

import { getHeaderById } from './header';
import { getFooterById } from './footer';
import { IMAGE_GRAPHQL_FIELDS } from './image';

export const PAGE_BASIC_FIELDS = `
  ${SYS_FIELDS}
  title
  slug
  description
  openGraphImage {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  seoTitle
  seoDescription
`;

// Page fields with header/footer references only (no full data)
export const PAGE_WITH_REFS_FIELDS = `
  ${PAGE_BASIC_FIELDS}
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

/**
 * Fetches all pages from Contentful
 * @param preview - Whether to fetch draft content
 * @param skip - Number of pages to skip for pagination
 * @param limit - Maximum number of pages to fetch
 * @returns Promise resolving to pages response with pagination info
 */
export async function getAllPages(preview = false, skip = 0, limit = 10): Promise<PageResponse> {
  try {
    // Use minimal fields for listing pages to avoid QUERY_TOO_BIG
    const response = await fetchGraphQL<Page>(
      `query GetAllPages($preview: Boolean!, $skip: Int!, $limit: Int!) {
        pageCollection(preview: $preview, skip: $skip, limit: $limit) {
          items {
            ${PAGE_WITH_REFS_FIELDS}
          }
          total
        }
      }`,
      { preview, skip, limit },
      preview
    );

    if (!response.data?.pageCollection) {
      throw new ContentfulError('Failed to fetch pages from Contentful');
    }

    return {
      items: response.data.pageCollection.items,
      total: response.data.pageCollection.total
    };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching pages: ${error.message}`);
    }
    throw new Error('Unknown error fetching pages');
  }
}

/**
 * Fetches a single page by slug
 * @param slug - The slug of the page to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the page or null if not found
 */
export async function getPageBySlug(slug: string, preview = true): Promise<Page | null> {
  try {
    // First, fetch the basic page data with references
    const response = await fetchGraphQL<PageWithRefs>(
      `query GetPageBySlug($slug: String!, $preview: Boolean!) {
        pageCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
          items {
            ${PAGE_WITH_REFS_FIELDS}
          }
        }
      }`,
      { slug, preview },
      preview
    );

    if (!response.data?.pageCollection?.items?.length) {
      return null;
    }

    const pageData = response.data.pageCollection.items[0]!;

    // Fetch header data if referenced
    let header = null;
    if (pageData.header?.sys?.id) {
      header = await getHeaderById(pageData.header.sys.id, preview);
    }

    // Fetch footer data if referenced
    let footer = null;
    if (pageData.footer?.sys?.id) {
      footer = await getFooterById(pageData.footer.sys.id, preview);
    }

    // Fetch page content separately
    const pageContentResponse = await fetchGraphQL(
      `query GetPageContent($slug: String!, $preview: Boolean!) {
        pageCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
          items {
            pageContentCollection(limit: 10) {
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
      const items = pageContentResponse.data?.pageCollection?.items;
      if (items && items.length > 0 && items[0]) {
        // Type assertion is safe here since we know the GraphQL query structure
        const pageItem = items[0] as { pageContentCollection?: { items: Array<unknown> } };
        pageContent = pageItem.pageContentCollection ?? null;
      }
    } catch (error) {
      console.warn('Failed to extract page content:', error);
      pageContent = null;
    }

    // Combine all the data
    return {
      ...pageData,
      header,
      footer,
      pageContentCollection: pageContent
    } as Page;
  } catch (error) {
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching page by slug: ${error.message}`);
    }
    throw new Error('Unknown error fetching page by slug');
  }
}
