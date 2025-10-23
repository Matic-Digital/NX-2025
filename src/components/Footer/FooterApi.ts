/**
 * Contentful API Integration Module
 * Provides functions for fetching and managing blog articles from Contentful CMS
 */

import { cache } from 'react';

import { fetchGraphQL } from '@/lib/api';
import { getFOOTER_GRAPHQL_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, GraphQLError, NetworkError } from '@/lib/errors';

// Types
import type { Footer, FooterResponse } from '@/components/Footer/FooterSchema';

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
            ${getFOOTER_GRAPHQL_FIELDS()}
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
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Footers: ${_error.message}`);
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
export const getFooterById = cache(async (id: string, preview = false): Promise<Footer | null> => {
  try {
    const response = await fetchGraphQL<Footer>(
      `query GetFooterById($id: String!, $preview: Boolean!) {
        footerCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            ${getFOOTER_GRAPHQL_FIELDS()}
          }
        }
      }`,
      { id, preview },
      preview
    );

    if (!response.data?.footerCollection?.items?.length) {
      return null;
    }

    const footer = response.data.footerCollection.items[0];
    return footer ?? null;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof GraphQLError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Footer by ID: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Footer by ID');
  }
});
