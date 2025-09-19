import { fetchGraphQL } from '../../lib/api';
import type { TimelineSliderItem } from '@/components/TimelineSlider/TimelineSliderItemSchema';
import { ContentfulError, NetworkError } from '../../lib/errors';
import { SYS_FIELDS } from '../../lib/contentful-api/graphql-fields';
import { VIDEO_GRAPHQL_FIELDS } from '../Video/VideoApi';
import { IMAGE_GRAPHQL_FIELDS } from '../Image/ImageApi';

// Simplified Product fields for individual Product queries (to stay within Contentful query size limit)
export const TIMELINE_SLIDERITEM_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  year
  description
  asset {
    ... on Image {
      ${IMAGE_GRAPHQL_FIELDS}
    }
    ... on Video {
      ${VIDEO_GRAPHQL_FIELDS}
    }
  }
`;

export async function getTimelineSliderItemsByIds(
  ids: string[],
  preview = false
): Promise<TimelineSliderItem[]> {
  if (ids.length === 0) {
    return [];
  }

  const query = `
    query GetTimelineSliderItemsByIds($ids: [String!]!, $preview: Boolean!) {
      timelineSliderItemCollection(where: { sys: { id_in: $ids } }, preview: $preview) {
        items {
          ${TIMELINE_SLIDERITEM_GRAPHQL_FIELDS}
        }
      }
    }
  `;

  try {
    const response = await fetchGraphQL(query, { ids, preview }, preview);

    // Check for valid response
    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to help TypeScript understand the structure
    const data = response.data as unknown as {
      timelineSliderItemCollection?: { items?: TimelineSliderItem[] };
    };

    // Return null if timeline slider items not found
    if (!data.timelineSliderItemCollection?.items) {
      return [];
    }

    return data.timelineSliderItemCollection.items;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching TimelineSliderItems: ${error.message}`);
    }
    throw new Error('Unknown error fetching TimelineSliderItems');
  }
}
