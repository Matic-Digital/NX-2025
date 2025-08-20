import { fetchGraphQL } from '../api';
import type { PageList, PageListResponse, PageListWithRefs } from '@/types/contentful/PageList';
import type { Header } from '@/types/contentful/Header';
import type { Footer } from '@/types/contentful/Footer';
import type { PageLayout } from '@/types/contentful/PageLayout';
import { ContentfulError, NetworkError } from '../errors';
import { BANNERHERO_GRAPHQL_FIELDS } from './banner-hero';
import { CTABANNER_GRAPHQL_FIELDS } from './cta-banner';
import { CONTENTGRID_GRAPHQL_FIELDS } from './content-grid';
import { IMAGEBETWEEN_GRAPHQL_FIELDS } from './image-between';
import { SYS_FIELDS } from './graphql-fields';

import { getHeaderById } from './header';
import { getFooterById } from './footer';

// Define a new interface that extends PageList with header and footer
interface PageListWithHeaderFooter extends PageList {
  header: Header | null;
  footer: Footer | null;
}
import {
  getEXTERNAL_PAGE_FIELDS,
  getPAGE_BASIC_FIELDS,
  getPRODUCT_BASIC_FIELDS,
  getSERVICE_BASIC_FIELDS,
  getSOLUTION_BASIC_FIELDS,
  getPOST_BASIC_FIELDS,
  getPAGELIST_BASIC_FIELDS,
  getPAGELIST_WITH_REFS_FIELDS
} from './graphql-fields';

// Minimal PageList fields for initial fetch
export const PAGELIST_MINIMAL_FIELDS = `
  ${getPAGELIST_BASIC_FIELDS()}
  pagesCollection(limit: 10) {
    items {
      ... on Page {
        ${getPAGE_BASIC_FIELDS()}
      }
      ... on ExternalPage {
        ${getEXTERNAL_PAGE_FIELDS()}
      }
      ... on Product {
        ${getPRODUCT_BASIC_FIELDS()}
      }
      ... on Service {
        ${getSERVICE_BASIC_FIELDS()}
      }
      ... on Solution {
        ${getSOLUTION_BASIC_FIELDS()}
      }
      ... on Post {
        ${getPOST_BASIC_FIELDS()}
      }
      ... on PageList {
        ${getPAGELIST_BASIC_FIELDS()}
      }
    }
  }
`;

// PageList fields with page layout (header/footer references) only (no full data)
export const PAGELIST_WITH_REFS_FIELDS = `
    ${getPAGELIST_BASIC_FIELDS()}
    ${getPAGELIST_WITH_REFS_FIELDS()}
`;

// Simplified PageList fields for listing and reference checks
export const PAGELIST_SIMPLIFIED_FIELDS = `
  ${getPAGELIST_BASIC_FIELDS()}
  pagesCollection(limit: 20) {
    items {
      ... on Page {
        ${getPAGE_BASIC_FIELDS()}
      }
      ... on ExternalPage {
        ${getEXTERNAL_PAGE_FIELDS()}
      }
      ... on Product {
        ${getPRODUCT_BASIC_FIELDS()}
      }
      ... on Service {
        ${getSERVICE_BASIC_FIELDS()}
      }
      ... on Solution {
        ${getSOLUTION_BASIC_FIELDS()}
      }
      ... on Post {
        ${getPOST_BASIC_FIELDS()}
      }
      ... on PageList {
        ${getPAGELIST_BASIC_FIELDS()}
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
      console.log(
        `Checking PageList: ${pageList.title ?? 'Untitled'} (${pageList.slug ?? 'no-slug'})`
      );

      if (!pageList.pagesCollection?.items?.length) {
        console.log(`PageList ${pageList.title ?? 'Untitled'} has no pages`);
        continue;
      }

      console.log(
        `PageList ${pageList.title ?? 'Untitled'} has ${pageList.pagesCollection.items.length} pages`
      );

      // Log all page IDs in this PageList for debugging
      const pageIds = pageList.pagesCollection.items
        .map((item) => item?.sys?.id)
        .filter((id): id is string => Boolean(id));
      console.log(`Page IDs in PageList ${pageList.title ?? 'Untitled'}:`, pageIds);

      const pageInList = pageList.pagesCollection.items.some((item) => item?.sys?.id === pageId);

      if (pageInList) {
        console.log(
          `Page with ID '${pageId}' belongs to PageList '${pageList.title ?? 'Untitled'}' (${pageList.slug ?? 'no-slug'})`
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
 * @returns Promise resolving to the page list with header and footer or null if not found
 */
export async function getPageListBySlug(
  slug: string,
  preview = false
): Promise<PageListWithHeaderFooter | null> {
  try {
    // Log the request for debugging
    console.log(`Fetching PageList with slug: ${slug}, preview: ${preview}`);

    // First, fetch the basic PageList data with references
    const response = await fetchGraphQL<PageListWithRefs>(
      `query GetPageListBySlug($slug: String!, $preview: Boolean!) {
        pageListCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
          items {
            sys {
              id
            }
            title
            slug
            pagesCollection(limit: 10) {
              items {
                __typename
                ... on Page {
                  sys {
                    id
                  }
                  title
                  slug
                }
                ... on ExternalPage {
                  sys {
                    id
                  }
                  title
                  link
                }
                ... on Product {
                  sys {
                    id
                  }
                  title
                  slug
                }
                ... on Service {
                  sys {
                    id
                  }
                  title
                  slug
                }
                ... on Solution {
                  sys {
                    id
                  }
                  title
                  slug
                }
                ... on Post {
                  sys {
                    id
                  }
                  title
                  slug
                }
                ... on PageList {
                  sys {
                    id
                  }
                  title
                  slug
                }
              }
            }
            pageLayout {
              sys {
                id
              }
              header {
                sys {
                  id
                }
              }
              footer {
                sys {
                  id
                }
              }
            }
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

    // Type assertion for pageLayout to avoid 'any' type
    const pageLayout = pageListData.pageLayout as PageLayout | undefined;

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

    // Fetch page content separately with simplified fields
    const pageContentResponse = await fetchGraphQL(
      `query GetPageListContent($slug: String!, $preview: Boolean!) {
        pageListCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
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
              }
            }
          }
        }
      }`,
      { slug, preview },
      preview
    );

    // Safely extract page content with proper error checking
    let pageContent: { items: Array<{ sys: { id: string }; title?: string; description?: string; __typename?: string }> } | undefined = undefined;
    try {
      const items = pageContentResponse.data?.pageListCollection?.items;
      if (items && items.length > 0 && items[0]) {
        // Type assertion is safe here since we know the GraphQL query structure
        const pageListItem = items[0] as { pageContentCollection?: { items: Array<{ sys: { id: string }; title?: string; description?: string; __typename?: string }> } };
        pageContent = pageListItem.pageContentCollection;
      }
    } catch (error) {
      console.warn('Failed to extract page list content:', error);
      pageContent = undefined;
    }

    // Combine all the data
    const result: PageListWithHeaderFooter = {
      ...pageListData,
      header,
      footer,
      pageContentCollection: pageContent
    };

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

/**
 * Fetches a single page list by ID
 * @param id - The ID of the page list to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the page list with header and footer or null if not found
 */
export async function getPageListById(
  id: string,
  preview = false
): Promise<PageListWithHeaderFooter | null> {
  try {
    // Log the request for debugging
    console.log(`Fetching PageList with ID: ${id}, preview: ${preview}`);

    // First, fetch the basic PageList data with references
    const response = await fetchGraphQL<PageListWithRefs>(
      `query GetPageListById($id: String!, $preview: Boolean!) {
        pageListCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            ${PAGELIST_WITH_REFS_FIELDS}
          }
        }
      }`,
      { id, preview },
      preview
    );

    // Check if we have any results
    if (!response.data?.pageListCollection?.items?.length) {
      console.log(`No PageList found with ID: ${id}`);
      return null;
    }

    console.log(`Successfully fetched PageList with ID: ${id}`);

    const pageListData = response.data.pageListCollection.items[0]!;

    // Type assertion for pageLayout to avoid 'any' type
    const pageLayout = pageListData.pageLayout as PageLayout | undefined;

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
      `query GetPageListContentById($id: String!, $preview: Boolean!) {
        pageListCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            pageContentCollection {
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
              }
            }
          }
        }
      }`,
      { id, preview },
      preview
    );

    // Safely extract page content with proper error checking
    let pageContent: { items: Array<{ sys: { id: string }; title?: string; description?: string; __typename?: string }> } | undefined = undefined;
    try {
      const items = pageContentResponse.data?.pageListCollection?.items;
      if (items && items.length > 0 && items[0]) {
        // Type assertion is safe here since we know the GraphQL query structure
        const pageListItem = items[0] as { pageContentCollection?: { items: Array<{ sys: { id: string }; title?: string; description?: string; __typename?: string }> } };
        pageContent = pageListItem.pageContentCollection;
      }
    } catch (error) {
      console.warn('Failed to extract page list content:', error);
      pageContent = undefined;
    }

    // Combine all the data
    const result: PageListWithHeaderFooter = {
      ...pageListData,
      header,
      footer,
      pageContentCollection: pageContent
    };

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
    console.error(`Error handling ID: ${id}`, error);
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching page list by ID: ${error.message}`);
    }
    throw new Error('Unknown error fetching page list by ID');
  }
}
