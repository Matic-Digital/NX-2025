import { fetchGraphQL } from '../api';

import type { CtaBanner, CtaBannerResponse } from '@/types/contentful';
import { INTERNAL_LINK_FIELDS, SYS_FIELDS, ASSET_FIELDS } from './graphql-fields';
import { IMAGE_GRAPHQL_FIELDS } from './image';
import { ContentfulError, NetworkError } from '../errors';

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
    sys { id }
    text
    internalText
    internalLink {
      ${INTERNAL_LINK_FIELDS}
    }
    externalLink
  }
  secondaryCta {
    sys { id }
    text
    internalText
    internalLink {
      ${INTERNAL_LINK_FIELDS}
    }
    externalLink
    modal {
      sys { id }
      title
      description
    }
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
