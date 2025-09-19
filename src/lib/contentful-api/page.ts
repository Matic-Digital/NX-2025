import { fetchGraphQL } from '../api';
import type { Page, PageResponse, PageWithRefs } from '@/types/contentful/Page';
import type { Header } from '@/types/contentful/Header';
import type { Footer } from '@/types/contentful/Footer';
import type { PageLayout as PageLayoutType } from '@/components/PageLayout/PageLayoutSchema';
import { ContentfulError, NetworkError } from '../errors';
import { BANNERHERO_GRAPHQL_FIELDS } from '../../components/BannerHero/BannerHeroApi';
import { CTABANNER_GRAPHQL_FIELDS } from '../../components/CtaBanner/CtaBannerApi';
import { CONTENTGRID_GRAPHQL_FIELDS } from '../../components/ContentGrid/ContentGridApi';
import { IMAGEBETWEEN_GRAPHQL_FIELDS } from '../../components/ImageBetween/ImageBetweenApi';
import { REGIONS_MAP_GRAPHQL_FIELDS } from '../../components/Region/RegionApi';
import { SYS_FIELDS } from './graphql-fields';

import { getHeaderById } from './header';
import { getFooterById } from './footer';

import { getPAGE_WITH_REFS_FIELDS } from './graphql-fields';

// Define a new interface that extends Page with header and footer
interface PageWithHeaderFooter extends Page {
  header: Header | null;
  footer: Footer | null;
}

/**
 * Fetches all pages from Contentful with minimal data (for collections/listings)
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to pages response with minimal data
 */
export async function getAllPagesMinimal(preview = false): Promise<PageResponse> {
  try {
    const response = await fetchGraphQL<Page>(
      `query GetAllPagesMinimal($preview: Boolean!) {
        pageCollection(preview: $preview) {
          items {
            ${SYS_FIELDS}
            title
            slug
            description
            openGraphImage {
              link
              altText
            }
            contentfulMetadata {
              tags {
                id
                name
              }
            }
          }
          total
        }
      }`,
      { preview },
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
            ${getPAGE_WITH_REFS_FIELDS()}
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
 * @returns Promise resolving to the page with header and footer or null if not found
 */
export async function getPageBySlug(
  slug: string,
  preview = true
): Promise<PageWithHeaderFooter | null> {
  try {
    // First, fetch the basic page data with references
    const response = await fetchGraphQL<PageWithRefs>(
      `query GetPageBySlug($slug: String!, $preview: Boolean!) {
        pageCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
          items {
            ${getPAGE_WITH_REFS_FIELDS()}
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

    // Type assertion for pageLayout to avoid 'any' type
    const pageLayout = pageData.pageLayout as PageLayoutType | undefined;

    // Fetch header data if referenced
    let header = null;
    if (pageLayout?.header) {
      // Type assertion for header reference
      const headerRef = pageLayout.header as { sys: { id: string } };
      if (headerRef.sys?.id) {
        header = await getHeaderById(headerRef.sys.id, preview);
      }
    }

    // Fetch footer data if referenced
    let footer = null;
    if (pageLayout?.footer) {
      // Type assertion for footer reference
      const footerRef = pageLayout.footer as { sys: { id: string } };
      if (footerRef.sys?.id) {
        footer = await getFooterById(footerRef.sys.id, preview);
      }
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
                ... on Content {
                  ${SYS_FIELDS}
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
                ... on RegionsMap {
                  ${SYS_FIELDS}
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
    } as PageWithHeaderFooter;
  } catch (error) {
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching page by slug: ${error.message}`);
    }
    throw new Error('Unknown error fetching page by slug');
  }
}

/**
 * Fetches a single page by ID
 * @param id - The ID of the page to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the page with header and footer or null if not found
 */
export async function getPageById(
  id: string,
  preview = false
): Promise<PageWithHeaderFooter | null> {
  try {
    // First, fetch the basic page data with references
    const response = await fetchGraphQL<PageWithRefs>(
      `query GetPageById($id: String!, $preview: Boolean!) {
        pageCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            ${getPAGE_WITH_REFS_FIELDS()}
          }
        }
      }`,
      { id, preview },
      preview
    );

    if (!response.data?.pageCollection?.items?.length) {
      return null;
    }

    const pageData = response.data.pageCollection.items[0]!;

    // Type assertion for pageLayout to avoid 'any' type
    const pageLayout = pageData.pageLayout as PageLayoutType | undefined;

    // Fetch header data if referenced
    let header = null;
    if (pageLayout?.header) {
      // Type assertion for header reference
      const headerRef = pageLayout.header as { sys: { id: string } };
      if (headerRef.sys?.id) {
        header = await getHeaderById(headerRef.sys.id, preview);
      }
    }

    // Fetch footer data if referenced
    let footer = null;
    if (pageLayout?.footer) {
      // Type assertion for footer reference
      const footerRef = pageLayout.footer as { sys: { id: string } };
      if (footerRef.sys?.id) {
        footer = await getFooterById(footerRef.sys.id, preview);
      }
    }

    // Fetch page content separately
    const pageContentResponse = await fetchGraphQL(
      `query GetPageContentById($id: String!, $preview: Boolean!) {
        pageCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            pageContentCollection(limit: 10) {
              items {
                ... on BannerHero {
                  ${BANNERHERO_GRAPHQL_FIELDS}
                }
                ... on Content {
                  ${SYS_FIELDS}
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
                ... on RegionsMap {
                  ${REGIONS_MAP_GRAPHQL_FIELDS}
                }
              }
            }
          }
        }
      }`,
      { id, preview },
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
    } as PageWithHeaderFooter;
  } catch (error) {
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching page by ID: ${error.message}`);
    }
    throw new Error('Unknown error fetching page by ID');
  }
}
