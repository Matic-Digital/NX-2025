import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import type { Image, ImageResponse } from '@/components/Image/ImageSchema';

export const IMAGE_SIMPLE_GRAPHQL_FIELDS = `
  link
  altText
  mobileOrigin
`;

// Image fields for Image content type (not Contentful Asset)
export const IMAGE_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  link
  altText
  mobileOrigin
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
