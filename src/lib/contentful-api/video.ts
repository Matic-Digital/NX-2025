import { fetchGraphQL } from '../api';
import type { Video } from '@/types/contentful';
import { SYS_FIELDS } from './graphql-fields';
import { ContentfulError, NetworkError } from '../errors';

// Video fields
export const VIDEO_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  playbackId
  id
  title
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
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Sliders: ${error.message}`);
    }
    throw new Error('Unknown error fetching Sliders');
  }
}
