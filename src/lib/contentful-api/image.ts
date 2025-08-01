import { fetchGraphQL } from '../api';

import type { Image, ImageResponse } from '@/types/contentful';

import { ContentfulError, NetworkError } from '../errors';

const SYS_FIELDS = `
  sys {
    id
  }
  __typename
`;

// Image fields
export const IMAGE_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  link
  altText
`;

/**
 * Fetches all Images from Contentful
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to Images response with pagination info
 */
export async function getAllImages(preview = false): Promise<ImageResponse> {
  try {
    const response = await fetchGraphQL<Image>(
      `query GetAllImages($preview: Boolean!) {
        imageCollection(preview: $preview) {
          items {
            ${IMAGE_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { imageCollection?: { items?: Image[] } };

    // Validate the data structure
    if (!data.imageCollection?.items?.length) {
      throw new ContentfulError('Failed to fetch Images from Contentful');
    }

    return {
      items: data.imageCollection.items
    };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Images: ${error.message}`);
    }
    throw new Error('Unknown error fetching Images');
  }
}

/**
 * Fetches a single Image by ID from Contentful
 * @param id - The ID of the Image to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to Image or null if not found
 */
export async function getImageById(id: string, preview = false): Promise<Image | null> {
  try {
    const response = await fetchGraphQL<Image>(
      `query GetImageById($id: String!, $preview: Boolean!) {
        image(id: $id, preview: $preview) {
          ${IMAGE_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { image?: Image };

    // Return null if image not found
    if (!data.image) {
      return null;
    }

    return data.image;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Image: ${error.message}`);
    }
    throw new Error('Unknown error fetching Image');
  }
}
