/**
 * Contentful API Integration Module
 * Provides functions for fetching and managing blog articles from Contentful CMS
 */

// Types
import type { Footer, FooterResponse } from '@/types/contentful';
import { fetchGraphQL } from '../api';
import { ContentfulError, NetworkError } from '../errors';
import { SYS_FIELDS, ASSET_FIELDS, SOCIAL_BASIC_FIELDS } from './constants';
import { PAGE_BASIC_FIELDS, PAGE_WITH_REFS_FIELDS } from './page';
import { PAGELIST_BASIC_FIELDS, PAGELIST_WITH_REFS_FIELDS } from './page-list';
import { EXTERNAL_PAGE_FIELDS } from './external-page';

// Footer fields
const FOOTER_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  logo {
    ${ASSET_FIELDS}
  }
  description
  pageListsCollection(limit: 5) {
    items {
      ... on PageList {
        ${PAGELIST_WITH_REFS_FIELDS}
        pagesCollection(limit: 10) {
          items {
            ... on Page {
              ${PAGE_WITH_REFS_FIELDS}
            }
            ... on ExternalPage {
              ${EXTERNAL_PAGE_FIELDS}
            }
          }
        }
      }
    }
  }
  copyright
  legalPageListsCollection(limit: 5) {
    items {
      ... on PageList {
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
      }
    }
  }
  socialNetworksCollection(limit: 5) {
    items {
      ... on Social {
        ${SOCIAL_BASIC_FIELDS}
      }
    }
  }
`;

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
