import { fetchGraphQL } from '../api';
import { IMAGE_GRAPHQL_FIELDS } from './image';
import { SECTIONHEADING_GRAPHQL_FIELDS } from './section-heading';
import { SYS_FIELDS } from './constants';
import type { Slider } from '@/types/contentful';
import { ContentfulError, NetworkError } from '../errors';

// Minimal slider item fields with inline fragments for union types
const SLIDERITEM_GRAPHQL_FIELDS_SIMPLE = `
  ... on SliderItem {
    ${SYS_FIELDS}
    title
    heading {
      ${SECTIONHEADING_GRAPHQL_FIELDS}
    }
    image {
      ${IMAGE_GRAPHQL_FIELDS}
    }
  }
  ... on Image {
    ${SYS_FIELDS}
    title
    link
    altText
  }
`;

// Minimal slider fields for ContentGrid queries
export const SLIDER_GRAPHQL_FIELDS_SIMPLE = `
  ${SYS_FIELDS}
  title
  itemsCollection(limit: 10) {
    items {
      ${SLIDERITEM_GRAPHQL_FIELDS_SIMPLE}
    }
  }
`;

// Full slider fields for dedicated slider queries
export const SLIDER_GRAPHQL_FIELDS = SLIDER_GRAPHQL_FIELDS_SIMPLE;

/**
 * Fetches Slider data separately by IDs to avoid QUERY_TOO_BIG errors
 * @param sliderIds - Array of Slider IDs to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to array of Slider objects
 */
export async function getSlidersByIds(sliderIds: string[], preview = false): Promise<Slider[]> {
  if (sliderIds.length === 0) {
    return [];
  }

  const query = `
    query GetSlidersByIds($ids: [String!]!, $preview: Boolean!) {
      sliderCollection(where: { sys: { id_in: $ids } }, preview: $preview) {
        items {
          ${SLIDER_GRAPHQL_FIELDS_SIMPLE}
        }
      }
    }
  `;

  try {
    const response = await fetchGraphQL(query, {
      ids: sliderIds,
      preview
    });

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to help TypeScript understand the structure
    const data = response.data as unknown as {
      sliderCollection?: { items?: Slider[] };
    };

    // Validate the data structure
    if (!data.sliderCollection?.items?.length) {
      throw new ContentfulError('Failed to fetch Sliders from Contentful');
    }

    return data.sliderCollection.items;
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
