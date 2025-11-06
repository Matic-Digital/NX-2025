import { cache } from 'react';

import { fetchGraphQL } from '@/lib/api';
import { getCacheConfig } from '@/lib/cache-tags';
import { getHEADER_GRAPHQL_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, GraphQLError, NetworkError } from '@/lib/errors';

import type { Header, HeaderResponse } from '@/components/Header/HeaderSchema';

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
            ${getHEADER_GRAPHQL_FIELDS()}
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
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof GraphQLError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Headers: ${_error.message}`);
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
            ${getHEADER_GRAPHQL_FIELDS()}
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
  } catch (_error) {
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Header by name: ${_error.message}`);
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
export const getHeaderById = cache(async (id: string, preview = false): Promise<Header | null> => {
  try {
    // Generate cache configuration with proper tags
    const cacheConfig = getCacheConfig('Header', { id, slug: undefined });
    
    const response = await fetchGraphQL<Header>(
      `query GetHeaderById($id: String!, $preview: Boolean!) {
        headerCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            ${getHEADER_GRAPHQL_FIELDS()}
          }
        }
      }`,
      { id, preview },
      preview,
      cacheConfig
    );

    if (!response.data?.headerCollection?.items?.length) {
      return null;
    }

    // Handle the case where items might be empty
    const header = response.data.headerCollection?.items[0];
    return header ?? null;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof GraphQLError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Header by ID: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Header by ID');
  }
});
