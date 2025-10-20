import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { SLIDERITEM_GRAPHQL_FIELDS_SIMPLE } from '@/components/Slider/SliderItemApi';

import type { Slider } from '@/components/Slider/SliderSchema';

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
export const SLIDER_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  autoplay
  delay
  itemsCollection(limit: 10) {
    items {
      ${SLIDERITEM_GRAPHQL_FIELDS_SIMPLE}
    }
  }
`;

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

/**
 * Fetches a single Slider by ID from Contentful
 * @param id - The ID of the Slider to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to Slider or null if not found
 */
export async function getSliderById(id: string, preview = false): Promise<Slider | null> {
  try {
    const response = await fetchGraphQL(
      `query GetSliderById($id: String!, $preview: Boolean!) {
        slider(id: $id, preview: $preview) {
          ${SLIDER_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { slider?: Slider };

    // Return null if slider not found
    if (!data.slider) {
      return null;
    }

    return data.slider;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Slider: ${error.message}`);
    }
    throw new Error('Unknown error fetching Slider');
  }
}
