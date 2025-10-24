import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { IMAGE_SIMPLE_GRAPHQL_FIELDS } from '@/components/Image/ImageApi';

import type { Video } from '@/components/Video/VideoSchema';

// Video fields
export const VIDEO_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  id
  muxVideo
  posterImage {
    ${IMAGE_SIMPLE_GRAPHQL_FIELDS}
  }
`;

export async function getVideosByIds(videoIds: string[], preview = false): Promise<Video[]> {
  if (videoIds.length === 0) {
    return [];
  }

  const query = `
      query GetVideosByIds($ids: [String!]!, $preview: Boolean!) {
        videoCollection(where: { sys: { id_in: $ids } }, preview: $preview) {
          items {
            ${VIDEO_GRAPHQL_FIELDS}
          }
        }
      }
    `;

  try {
    const response = await fetchGraphQL(query, {
      ids: videoIds,
      preview
    });

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to help TypeScript understand the structure
    const data = response.data as unknown as {
      videoCollection?: { items?: Video[] };
    };

    // Validate the data structure
    if (!data.videoCollection?.items?.length) {
      throw new ContentfulError('Failed to fetch Videos from Contentful');
    }

    return data.videoCollection.items;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Videos: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Videos');
  }
}

export async function getVideoById(id: string, preview = false): Promise<Video | null> {
  const videos = await getVideosByIds([id], preview);
  return videos[0] ?? null;
}
