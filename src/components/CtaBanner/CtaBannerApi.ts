import { fetchGraphQL } from '../../lib/api';

import type { CtaBanner, CtaBannerResponse } from '@/types/contentful';
import { SYS_FIELDS, ASSET_FIELDS } from '../../lib/contentful-api/graphql-fields';
import { IMAGE_GRAPHQL_FIELDS } from '../Image/ImageApi';
import { ContentfulError, NetworkError } from '../../lib/errors';
import { BUTTON_GRAPHQL_FIELDS } from '@/components/Button/ButtonApi';

// CtaBanner fields
export const CTABANNER_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  description
  backgroundImage {
    ${ASSET_FIELDS}
  }
  backgroundMedia {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  primaryCta {
    ${BUTTON_GRAPHQL_FIELDS}
  }
  secondaryCta {
    ${BUTTON_GRAPHQL_FIELDS}
  }
`;

/**
 * Fetches all CtaBanners from Contentful
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to CtaBanners response with pagination info
 */
export async function getAllCtaBanners(preview = false): Promise<CtaBannerResponse> {
  try {
    const response = await fetchGraphQL<CtaBanner>(
      `query GetAllCtaBanners($preview: Boolean!) {
        ctaBannerCollection(preview: $preview) {
          items {
            ${CTABANNER_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { ctaBannerCollection?: { items?: CtaBanner[] } };

    // Validate the data structure
    if (!data.ctaBannerCollection?.items?.length) {
      throw new ContentfulError('Failed to fetch CtaBanners from Contentful');
    }

    return {
      items: data.ctaBannerCollection.items
    };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching CtaBanners: ${error.message}`);
    }
    throw new Error('Unknown error fetching CtaBanners');
  }
}

export async function getCtaBannerById(id: string, preview = false): Promise<CtaBanner | null> {
  try {
    const response = await fetchGraphQL<CtaBanner>(
      `query GetCtaBannerById($id: String!, $preview: Boolean!) {
        ctaBanner(id: $id, preview: $preview) {
          ${CTABANNER_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { ctaBanner?: CtaBanner };

    // Validate the data structure
    if (!data.ctaBanner) {
      throw new ContentfulError('Failed to fetch CtaBanner from Contentful');
    }

    return data.ctaBanner;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching CtaBanner: ${error.message}`);
    }
    throw new Error('Unknown error fetching CtaBanner');
  }
}
