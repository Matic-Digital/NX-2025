import { fetchGraphQL } from '../api';
import { IMAGE_GRAPHQL_FIELDS } from './image';
import { SECTION_HEADING_GRAPHQL_FIELDS } from './section-heading';
import { SYS_FIELDS } from './graphql-fields';
import type { Slider, SliderItem } from '@/types/contentful';
import { ContentfulError, NetworkError } from '../errors';
import { POST_SLIDER_GRAPHQL_FIELDS } from './post';
import { FEATURE_SLIDERITEM_GRAPHQL_FIELDS } from './feature-slider-item';
import { TIMELINE_SLIDERITEM_GRAPHQL_FIELDS } from './timeline-slider-item';
import { TEAM_MEMBER_GRAPHQL_FIELDS } from './team-member';

// Minimal slider item fields with inline fragments for union types
const SLIDERITEM_GRAPHQL_FIELDS_SIMPLE = `
  ... on SliderItem {
    ${SYS_FIELDS}
    title
    heading {
      ${SECTION_HEADING_GRAPHQL_FIELDS}
    }
    image {
      ${IMAGE_GRAPHQL_FIELDS}
    }
  }
  ... on Image {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  ... on Post {
    ${POST_SLIDER_GRAPHQL_FIELDS}
  }
  ... on FeatureSliderItem {
    ${FEATURE_SLIDERITEM_GRAPHQL_FIELDS}
  }
  ... on TimelineSliderItem {
    ${TIMELINE_SLIDERITEM_GRAPHQL_FIELDS}
  }
  ... on TeamMember {
    ${TEAM_MEMBER_GRAPHQL_FIELDS}
  }
`;

// Specific fields for individual SliderItem queries (no union types)
const SLIDERITEM_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  heading {
    ${SECTION_HEADING_GRAPHQL_FIELDS}
  }
  image {
    ${IMAGE_GRAPHQL_FIELDS}
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

/**
 * Fetches a single SliderItem by ID from Contentful
 * @param id - The ID of the SliderItem to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to SliderItem or null if not found
 */
export async function getSliderItemById(id: string, preview = false): Promise<SliderItem | null> {
  try {
    const response = await fetchGraphQL(
      `query GetSliderItemById($id: String!, $preview: Boolean!) {
        sliderItem(id: $id, preview: $preview) {
          ${SLIDERITEM_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { sliderItem?: SliderItem };

    // Return null if slider item not found
    if (!data.sliderItem) {
      return null;
    }

    return data.sliderItem;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching SliderItem: ${error.message}`);
    }
    throw new Error('Unknown error fetching SliderItem');
  }
}
