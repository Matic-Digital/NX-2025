import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { IMAGE_GRAPHQL_FIELDS } from '@/components/Image/ImageApi';

import type {
  OfficeLocation as ContentfulLocation,
  OfficeLocationResponse
} from '@/components/OfficeLocation/OfficeLocationSchema';

// Location fields
export const LOCATION_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  image {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  country
  city
  state
  address
  phone
`;

/**
 * Fetches a single Location by ID from Contentful
 * @param id - The ID of the Location to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to Location or null if not found
 */
export async function getLocationById(
  id: string,
  preview = false
): Promise<ContentfulLocation | null> {
  try {
    const response = await fetchGraphQL(
      `query GetOfficeLocationById($id: String!, $preview: Boolean!) {
        officeLocation(id: $id, preview: $preview) {
          ${LOCATION_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { officeLocation?: ContentfulLocation };

    // Return null if location not found
    if (!data.officeLocation) {
      return null;
    }

    return data.officeLocation;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Location: ${error.message}`);
    }
    throw new Error('Unknown error fetching Location');
  }
}

/**
 * Fetches all Locations from Contentful
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to Locations response with pagination info
 */
export async function getAllLocations(preview = false): Promise<OfficeLocationResponse> {
  try {
    const response = await fetchGraphQL<ContentfulLocation>(
      `query GetAllLocations($preview: Boolean!) {
        officeLocationCollection(preview: $preview) {
          items {
            ${LOCATION_GRAPHQL_FIELDS}
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
      officeLocationCollection?: { items?: ContentfulLocation[] };
    };

    // Validate the data structure
    if (!data.officeLocationCollection?.items?.length) {
      throw new ContentfulError('Failed to fetch Locations from Contentful');
    }

    return {
      items: data.officeLocationCollection.items
    };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Locations: ${error.message}`);
    }
    throw new Error('Unknown error fetching Locations');
  }
}
