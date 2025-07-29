import { fetchGraphQL } from '../api';

import type { ContentGrid, ContentGridResponse } from '@/types/contentful';

import { SECTIONHEADING_GRAPHQL_FIELDS } from './section-heading';

import { ContentfulError, NetworkError } from '../errors';

const SYS_FIELDS = `
  sys {
    id
  }
  __typename
`;

const ASSET_FIELDS = `
  sys {
    id
  }
  title
  description
  url
  width
  height
`;

const IMAGE_FIELDS = `
  sys {
    id
  }
  internalName
  link
  altText
`;

// ContentGridItem fields
export const CONTENTGRIDITEM_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  link {
    sys {
      id
    }
    slug
  }
  description
  icon {
    ${ASSET_FIELDS}
  }
  image {
    ${IMAGE_FIELDS}
  }
`;

// ContentGrid fields
export const CONTENTGRID_GRAPHQL_FIELDS = `
  ${SYS_FIELDS} 
  heading {
    ${SECTIONHEADING_GRAPHQL_FIELDS}
  }
  itemsCollection(limit: 6) {
    items {
      ... on ContentGridItem {
        ${CONTENTGRIDITEM_GRAPHQL_FIELDS}
      }
    }
  }
`;

/**
 * Fetches all ContentGrids from Contentful
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to ContentGrids response with pagination info
 */
export async function getAllContentGrids(preview = false): Promise<ContentGridResponse> {
  try {
    const response = await fetchGraphQL<ContentGrid>(
      `query GetAllContentGrids($preview: Boolean!) {
        contentGridCollection(preview: $preview) {
          items {
            ${CONTENTGRID_GRAPHQL_FIELDS}
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
      contentGridCollection?: { items?: ContentGrid[] };
    };

    // Validate the data structure
    if (!data.contentGridCollection?.items?.length) {
      throw new ContentfulError('Failed to fetch ContentGrids from Contentful');
    }

    return {
      items: data.contentGridCollection.items
    };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching ContentGrids: ${error.message}`);
    }
    throw new Error('Unknown error fetching ContentGrids');
  }
}
