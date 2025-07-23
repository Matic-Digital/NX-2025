/**
 * Contentful API Integration Module
 * Provides functions for fetching and managing blog articles from Contentful CMS
 */

// Types
import type {
  Hero,
  HeroResponse,
  Page,
  Footer,
  FooterResponse,
  PageResponse,
  PageList,
  PageListResponse,
  Header,
  HeaderResponse,
  GraphQLResponse
} from '@/types/contentful';

import { CTABANNER_GRAPHQL_FIELDS, HERO_GRAPHQL_FIELDS } from '@/lib/contentful-api';

import { ContentfulError, NetworkError, GraphQLError } from './errors';

// Base fields for all content types
const SYS_FIELDS = `
  sys {
    id
  }
  __typename
`;

// Asset fields
const ASSET_FIELDS = `
  sys {
    id
  }
  title
  description
  url
  width
  height
`;

// Page fields (without circular references)
const PAGE_BASIC_FIELDS = `
  ${SYS_FIELDS}
  name
  slug
  description
`;

// PageList fields (without circular references)
const PAGELIST_BASIC_FIELDS = `
  ${SYS_FIELDS}
  name
  slug
`;

// Header fields
const HEADER_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  name
  logo {
    ${ASSET_FIELDS}
  }
  navLinksCollection {
    items {
      ... on Page {
        ${PAGE_BASIC_FIELDS}
      }
      ... on PageList {
        ${PAGELIST_BASIC_FIELDS}
        pagesCollection {
          items {
            ${SYS_FIELDS}
            name
            slug
            description
          }
        }
      }
    }
  }
`;

// Footer fields
const FOOTER_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  name
  description
  copyright
  logo {
    ${ASSET_FIELDS}
  }
  pageListsCollection(limit: 5) {
    items {
      ... on PageList {
        ${PAGELIST_BASIC_FIELDS}
        pagesCollection(limit: 10) {
          items {
            ... on Page {
              ${PAGE_BASIC_FIELDS}
            }
          }
        }
      }
    }
  }
`;

// Complete PageList fields (with page references)
const PAGELIST_GRAPHQL_FIELDS = `
  ${PAGELIST_BASIC_FIELDS}
  pagesCollection(limit: 10) {
    items {
      ... on Page {
        ${PAGE_BASIC_FIELDS}
      }
    }
  }
  header {
    ... on Header {
      ${HEADER_GRAPHQL_FIELDS}
    }
  }
  footer {
    ... on Footer {
      ${FOOTER_GRAPHQL_FIELDS}
    }
  }
  pageContentCollection {
    items {
      ... on Hero {
        ${HERO_GRAPHQL_FIELDS}
      }
      ... on CtaBanner {
        ${CTABANNER_GRAPHQL_FIELDS}
      }
    }
  }
`;

// Simplified PageList fields for listing and reference checks
const PAGELIST_SIMPLIFIED_FIELDS = `
  ${PAGELIST_BASIC_FIELDS}
  pagesCollection(limit: 10) {
    items {
      ... on Page {
        ${PAGE_BASIC_FIELDS}
      }
    }
  }
`;

// Complete Page fields (with component references)
const PAGE_GRAPHQL_FIELDS = `
  ${PAGE_BASIC_FIELDS}
  header {
    ${HEADER_GRAPHQL_FIELDS}
  }
  footer {
    ${FOOTER_GRAPHQL_FIELDS}
  }
  pageContentCollection {
    items {
      ... on Hero {
        ${HERO_GRAPHQL_FIELDS}
      }
      ... on CtaBanner {
        ${CTABANNER_GRAPHQL_FIELDS}
      }
    }
  }
`;

/**
 * Executes GraphQL queries against Contentful's API with caching
 * @param query - GraphQL query string
 * @param variables - GraphQL variables
 * @param preview - Whether to use preview or production content
 * @returns Promise resolving to typed API response
 * @throws Error on network or GraphQL errors
 */
export async function fetchGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {},
  preview = false,
  cacheConfig?: { next: { revalidate: number } }
): Promise<GraphQLResponse<T>> {
  try {
    // Use explicit cache settings based on preview mode
    // For preview content, use no-store to ensure fresh content
    // For production content, use force-cache when not explicitly configured
    const cacheSettings = preview
      ? { cache: 'no-store' as const }
      : cacheConfig?.next
        ? { next: cacheConfig.next }
        : { cache: 'force-cache' as const };

    const response = await fetch(
      `https://graphql.contentful.com/content/v1/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${
            preview
              ? process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN
              : process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN
          }`
        },
        body: JSON.stringify({ query, variables }),
        ...cacheSettings
      }
    );

    if (!response.ok) {
      try {
        // Try to clone the response to read the body without consuming it
        const clonedResponse = response.clone();
        const responseBody = await clonedResponse.text();
        console.error('GraphQL error response body:', responseBody);
      } catch (cloneError) {
        // If cloning fails, just log the error and continue
        console.error('Error cloning response:', cloneError);
      }

      // This matches the test expectation
      throw new NetworkError(`Network error: ${response.statusText}`, response);
    }

    const json = (await response.json()) as GraphQLResponse<T>;

    // Check for GraphQL errors - ensure we're checking the array length
    if (json.errors && json.errors.length > 0) {
      console.error('GraphQL errors:', JSON.stringify(json.errors, null, 2));
      throw new GraphQLError('GraphQL query execution error', json.errors);
    }

    return json;
  } catch (error: unknown) {
    console.error('Error in fetchGraphQL:', error);

    // Log additional information about the query that failed
    console.error('Failed query:', query);
    console.error('Variables:', JSON.stringify(variables, null, 2));

    // Re-throw NetworkError and GraphQLError as they are already properly formatted
    if (error instanceof NetworkError || error instanceof GraphQLError) {
      throw error;
    }

    // For any other errors, wrap in ContentfulError
    throw new ContentfulError('Failed to fetch data from Contentful', error as Error);
  }
}

export const HEROES_PER_PAGE = 10;

/**
 * Fetches all heroes from Contentful
 * @param preview - Whether to fetch draft content
 * @param limit - Maximum number of heroes to fetch
 * @param skip - Number of heroes to skip for pagination
 * @returns Promise resolving to heroes response with pagination info
 */
export async function getAllHeroes(
  preview = false,
  limit = HEROES_PER_PAGE,
  skip = 0
): Promise<HeroResponse> {
  try {
    const response = await fetchGraphQL<Hero>(
      `query GetAllHeroes($preview: Boolean!, $limit: Int!, $skip: Int!) {
        heroCollection(preview: $preview, limit: $limit, skip: $skip) {
          items {
            ${HERO_GRAPHQL_FIELDS}
          }
          total
        }
      }`,
      { preview, limit, skip },
      preview
    );

    if (!response.data?.heroCollection) {
      throw new ContentfulError('Failed to fetch heroes from Contentful');
    }

    return {
      items: response.data.heroCollection.items,
      total: response.data.heroCollection.total
    };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching heroes: ${error.message}`);
    }
    throw new Error('Unknown error fetching heroes');
  }
}

/**
 * Fetches a single hero by ID
 * @param id - The ID of the hero to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the hero or null if not found
 */
export async function getHero(id: string, preview = true): Promise<Hero | null> {
  try {
    const response = await fetchGraphQL<Hero>(
      `query GetHeroById($id: String!, $preview: Boolean!) {
        heroCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            ${HERO_GRAPHQL_FIELDS}
          }
        }
      }`,
      { id, preview },
      preview
    );

    if (!response.data?.heroCollection?.items?.length) {
      return null;
    }

    return response.data.heroCollection.items[0]!;
  } catch (error) {
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching hero: ${error.message}`);
    }
    throw new Error('Unknown error fetching hero');
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
    const response = await fetchGraphQL<Page>(
      `query GetAllPages($preview: Boolean!, $skip: Int!, $limit: Int!) {
        pageCollection(preview: $preview, skip: $skip, limit: $limit) {
          items {
            ${PAGE_GRAPHQL_FIELDS}
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
    const response = await fetchGraphQL<Page>(
      `query GetPageBySlug($slug: String!, $preview: Boolean!) {
        pageCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
          items {
            ${PAGE_GRAPHQL_FIELDS}
          }
        }
      }`,
      { slug, preview },
      preview
    );

    if (!response.data?.pageCollection?.items?.length) {
      return null;
    }

    return response.data.pageCollection.items[0]!;
  } catch (error) {
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching page by slug: ${error.message}`);
    }
    throw new Error('Unknown error fetching page by slug');
  }
}

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
      console.log(`Checking PageList: ${pageList.name} (${pageList.slug})`);

      if (!pageList.pagesCollection?.items.length) {
        console.log(`PageList ${pageList.name} has no pages`);
        continue;
      }

      console.log(`PageList ${pageList.name} has ${pageList.pagesCollection.items.length} pages`);

      // Log all page IDs in this PageList for debugging
      const pageIds = pageList.pagesCollection.items.map((item) => item.sys.id);
      console.log(`Page IDs in PageList ${pageList.name}:`, pageIds);

      const pageInList = pageList.pagesCollection.items.some((item) => item.sys.id === pageId);

      if (pageInList) {
        console.log(
          `Page with ID '${pageId}' belongs to PageList '${pageList.name}' (${pageList.slug})`
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

/**
 * Fetches a page by slug within a specific PageList
 * @param pageListSlug - The slug of the parent PageList
 * @param pageSlug - The slug of the page to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the page and pageList or null if not found
 */
export async function getPageBySlugInPageList(
  pageListSlug: string,
  pageSlug: string,
  preview = true
): Promise<{ page: Page | null; pageList: PageList | null }> {
  try {
    // First, fetch the PageList
    const pageList = await getPageListBySlug(pageListSlug, preview);

    if (!pageList?.pagesCollection?.items.length) {
      return { page: null, pageList };
    }

    // Then fetch the page
    const page = await getPageBySlug(pageSlug, preview);

    if (!page) {
      return { page: null, pageList };
    }

    // Check if the page is in the PageList
    const pageInList = pageList.pagesCollection.items.some((item) => item.sys.id === page.sys.id);

    if (!pageInList) {
      return { page: null, pageList };
    }

    return { page, pageList };
  } catch (error) {
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching page by slug in page list: ${error.message}`);
    }
    throw new Error('Unknown error fetching page by slug in page list');
  }
}

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

    // Use the full fields to get header, footer, and page content
    const query = `query GetPageListBySlug($slug: String!, $preview: Boolean!) {
      pageListCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
        items {
          ${PAGELIST_GRAPHQL_FIELDS}
        }
      }
    }`;

    // Execute the query
    const response = await fetchGraphQL(query, { slug, preview }, preview);

    // Check if we have any results
    if (!response.data?.pageListCollection?.items?.length) {
      console.log(`No PageList found with slug: ${slug}`);
      return null;
    }

    console.log(`Successfully fetched PageList with slug: ${slug}`);

    // Get the first item from the collection
    const pageList = response.data.pageListCollection.items[0] as PageList;

    // Debug the PageList structure
    console.log('PageList structure:', {
      name: pageList.name,
      slug: pageList.slug,
      hasHeader: !!pageList.header,
      hasFooter: !!pageList.footer,
      hasPageContent: !!pageList.pageContentCollection,
      pagesCount: pageList.pagesCollection?.items?.length ?? 0
    });

    return pageList;
  } catch (error) {
    console.error(`Error handling slug: ${slug}`, error);
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching page list by slug: ${error.message}`);
    }
    throw new Error('Unknown error fetching page list by slug');
  }
}

/**
 * Fetches all Headers from Contentful
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the Header response
 */
export async function getAllHeaders(preview = false): Promise<HeaderResponse> {
  try {
    const response = await fetchGraphQL<Header>(
      `query GetAllHeaders($preview: Boolean!) {
        headerCollection(preview: $preview) {
          items {
            ${HEADER_GRAPHQL_FIELDS}
          }
          total
        }
      }`,
      { preview },
      preview
    );

    if (!response.data?.headerCollection) {
      throw new ContentfulError('Failed to fetch Headers from Contentful');
    }

    return {
      items: response.data.headerCollection.items,
      total: response.data.headerCollection.total
    };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof GraphQLError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Headers: ${error.message}`);
    }
    throw new Error('Unknown error fetching Headers');
  }
}

/**
 * Fetches a single Header by name
 * @param name - The name of the Header to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the Header or null if not found
 */
export async function getHeaderByName(name: string, preview = false): Promise<Header | null> {
  try {
    const response = await fetchGraphQL<Header>(
      `query GetHeaderByName($name: String!, $preview: Boolean!) {
        headerCollection(where: { name: $name }, limit: 1, preview: $preview) {
          items {
            ${HEADER_GRAPHQL_FIELDS}
          }
        }
      }`,
      { name, preview },
      preview
    );

    if (!response.data?.headerCollection?.items?.length) {
      return null;
    }

    return response.data.headerCollection.items[0]!;
  } catch (error) {
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Header by name: ${error.message}`);
    }
    throw new Error('Unknown error fetching Header by name');
  }
}

/**
 * Fetches a Header by its ID
 * @param id - The ID of the Header to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the Header or null if not found
 */
export async function getHeaderById(id: string, preview = false): Promise<Header | null> {
  try {
    const response = await fetchGraphQL<Header>(
      `query GetHeaderById($id: String!, $preview: Boolean!) {
        headerCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            ${HEADER_GRAPHQL_FIELDS}
          }
        }
      }`,
      { id, preview },
      preview
    );

    if (!response.data?.headerCollection?.items?.length) {
      return null;
    }

    // Handle the case where items might be empty
    const header = response.data.headerCollection?.items[0];
    return header ?? null;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof GraphQLError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Header by ID: ${error.message}`);
    }
    throw new Error('Unknown error fetching Header by ID');
  }
}

/**
 * Fetches all footers from Contentful
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the Footer response
 */
export async function getAllFooters(preview = true): Promise<FooterResponse> {
  try {
    const response = await fetchGraphQL<Footer>(
      `query GetAllFooters($preview: Boolean!) {
        footerCollection(preview: $preview) {
          items {
            ${FOOTER_GRAPHQL_FIELDS}
          }
          total
        }
      }`,
      { preview },
      preview
    );

    if (!response.data?.footerCollection) {
      throw new ContentfulError('Failed to fetch Footers from Contentful');
    }

    return {
      items: response.data.footerCollection.items,
      total: response.data.footerCollection.total
    };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Footers: ${error.message}`);
    }
    throw new Error('Unknown error fetching Footers');
  }
}

/**
 * Fetches a Footer by its ID
 * @param id - The ID of the Footer to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the Footer or null if not found
 */
export async function getFooterById(id: string, preview = true): Promise<Footer | null> {
  try {
    const response = await fetchGraphQL<Footer>(
      `query GetFooterById($id: String!, $preview: Boolean!) {
        footerCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            ${FOOTER_GRAPHQL_FIELDS}
          }
        }
      }`,
      { id, preview },
      preview
    );

    if (!response.data?.footerCollection?.items?.length) {
      return null;
    }

    return response.data.footerCollection.items[0]!;
  } catch (error) {
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Footer by ID: ${error.message}`);
    }
    throw new Error('Unknown error fetching Footer by ID');
  }
}
