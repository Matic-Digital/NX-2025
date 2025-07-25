import { fetchGraphQL } from '../api';

import type { FeaturesGrid, FeaturesGridResponse } from '@/types/contentful';

import { SECTIONHEADING_GRAPHQL_FIELDS } from './section-heading';

import { ContentfulError, NetworkError } from '../errors';

const SYS_FIELDS = `
  sys {
    id
  }
  __typename
`;

// FeaturesGrid fields
export const FEATURESGRID_GRAPHQL_FIELDS = `
  ${SYS_FIELDS} 
  heading {
    ${SECTIONHEADING_GRAPHQL_FIELDS}
  }
`;

/**
 * Fetches all FeaturesGrids from Contentful
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to FeaturesGrids response with pagination info
 */
export async function getAllFeaturesGrids(preview = false): Promise<FeaturesGridResponse> {
  try {
    const response = await fetchGraphQL<FeaturesGrid>(
      `query GetAllFeaturesGrids($preview: Boolean!) {
        featuresGridCollection(preview: $preview) {
          items {
            ${FEATURESGRID_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as {
      featuresGridCollection?: { items?: FeaturesGrid[] };
    };

    // Validate the data structure
    if (!data.featuresGridCollection?.items?.length) {
      throw new ContentfulError('Failed to fetch FeaturesGrids from Contentful');
    }

    return {
      items: data.featuresGridCollection.items
    };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching FeaturesGrids: ${error.message}`);
    }
    throw new Error('Unknown error fetching FeaturesGrids');
  }
}
