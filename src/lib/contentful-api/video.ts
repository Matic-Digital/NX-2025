import { fetchGraphQL } from '../api';

import type { Video, VideoResponse } from '@/types/contentful';

import { ContentfulError, NetworkError } from '../errors';

const SYS_FIELDS = `
  sys {
    id
  }
  __typename
`;

// Video fields
export const VIDEO_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  playbackId
  id
  title
`;

/**
 * Fetches all Videos from Contentful
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to Videos response with pagination info
 */
export async function getAllVideos(preview = false): Promise<VideoResponse> {
  try {
    const response = await fetchGraphQL<Video>(
      `query GetAllVideos($preview: Boolean!) {
        videoCollection(preview: $preview) {
          items {
            ${VIDEO_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { videoCollection?: { items?: Video[] } };

    // Validate the data structure
    if (!data.videoCollection?.items?.length) {
      throw new ContentfulError('Failed to fetch Videos from Contentful');
    }

    return {
      items: data.videoCollection.items
    };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Videos: ${error.message}`);
    }
    throw new Error('Unknown error fetching Videos');
  }
}

/**
 * Fetches a single Video by ID from Contentful
 * @param id - The ID of the Video to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to Video or null if not found
 */
export async function getVideoById(id: string, preview = false): Promise<Video | null> {
  try {
    const response = await fetchGraphQL<Video>(
      `query GetVideoById($id: String!, $preview: Boolean!) {
        video(id: $id, preview: $preview) {
          ${VIDEO_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { video?: Video };

    // Return null if video not found
    if (!data.video) {
      return null;
    }

    return data.video;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Video: ${error.message}`);
    }
    throw new Error('Unknown error fetching Video');
  }
}
