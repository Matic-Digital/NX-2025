import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import type { Collection, CollectionResponse } from '@/components/Collection/CollectionSchema';

// Collection GraphQL fields
export const COLLECTION_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  contentType
  itemsPerPage
  searchBar
  pagination
  contentfulMetadata {
    tags {
      id
      name
    }
  }
`;

/**
 * Fetches all Collections from Contentful
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to Collections response
 */
export async function getAllCollections(preview = false): Promise<CollectionResponse> {
  try {
    const response = await fetchGraphQL<Collection>(
      `query GetAllCollections($preview: Boolean!) {
        collectionCollection(preview: $preview) {
          items {
            ${COLLECTION_GRAPHQL_FIELDS}
          }
        }
      }`,
      { preview },
      preview
    );

    // Check for valid response
    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to help TypeScript understand the structure
    const data = response.data as unknown as { collectionCollection?: { items?: Collection[] } };

    // Return empty array if no collections found
    if (!data.collectionCollection?.items) {
      return { items: [] };
    }

    return {
      items: data.collectionCollection.items
    };
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Collections: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Collections');
  }
}

/**
 * Fetches a single Collection by ID from Contentful with server-side Post enrichment
 * @param id - The ID of the Collection to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to Collection with enriched Posts or null if not found
 */
export async function getCollectionById(id: string, preview = false): Promise<Collection | null> {
  try {
    const response = await fetchGraphQL<Collection>(
      `query GetCollectionById($id: String!, $preview: Boolean!) {
        collection(id: $id, preview: $preview) {
          ${COLLECTION_GRAPHQL_FIELDS}
        }
      }`,
      { id, preview },
      preview
    );

    // Check for valid response
    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to help TypeScript understand the structure
    const data = response.data as unknown as { collection?: Collection };

    // Return null if collection not found
    if (!data.collection) {
      return null;
    }

    const collection = data.collection;

    // Step 2: Server-side enrichment for Post collections (same pattern as ContentGrid/Page)
    if (collection.contentType?.includes('Post')) {
      try {
        const { getAllPosts } = await import('@/components/Post/PostApi');
        const enrichedPosts = await getAllPosts(preview);
        
        // Add enriched posts to collection for server-side rendering
        (collection as any).enrichedPosts = enrichedPosts?.items || [];
      } catch (error) {
        console.warn(`Collection API: Failed to enrich Posts for Collection ${id}:`, error);
      }
    }

    return collection;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Collection: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Collection');
  }
}
