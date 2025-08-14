import { fetchGraphQL } from '../api';

import type { ContentGrid, ContentGridResponse, ContentGridItem } from '@/types/contentful';

import { IMAGE_GRAPHQL_FIELDS } from './image';
import { SECTIONHEADING_GRAPHQL_FIELDS } from './section-heading';
import { SERVICE_GRAPHQL_FIELDS } from './service';
import { SYS_FIELDS, ASSET_FIELDS } from './graphql-fields';
import { ContentfulError, NetworkError } from '../errors';

// Simplified Post fields for ContentGrid (to avoid circular dependency)
const POST_GRAPHQL_FIELDS_SIMPLE = `
  ${SYS_FIELDS}
  title
  slug
  datePublished
  mainImage {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  categories
`;

// ContentGridItem fields
export const CONTENTGRIDITEM_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  heading
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
    ${IMAGE_GRAPHQL_FIELDS}
  }
`;

// ContentGrid fields
export const CONTENTGRID_GRAPHQL_FIELDS = `
  ${SYS_FIELDS} 
  heading {
    ${SECTIONHEADING_GRAPHQL_FIELDS}
  }
  backgroundImage {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  itemsCollection(limit: 20) {
    items {
      ... on ContentGridItem {
        ${CONTENTGRIDITEM_GRAPHQL_FIELDS}
      }
      ... on Post {
        ${POST_GRAPHQL_FIELDS_SIMPLE}
      }
      ... on Product {
        ${SYS_FIELDS}
      }
      ... on Service {
        ${SERVICE_GRAPHQL_FIELDS}
      }
      ... on Solution {
        ${SYS_FIELDS}
      }

      ... on Slider {
        ${SYS_FIELDS}
      }
      ... on CtaGrid {
        ${SYS_FIELDS}
      }
    }
  }
`;

/**
 * Fetches a single ContentGrid by ID from Contentful
 * @param id - The ID of the ContentGrid to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to ContentGrid or null if not found
 */
export async function getContentGridById(id: string, preview = false): Promise<ContentGrid | null> {
  try {
    const response = await fetchGraphQL(
      `query GetContentGridById($id: String!, $preview: Boolean!) {
        contentGrid(id: $id, preview: $preview) {
          ${CONTENTGRID_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { contentGrid?: ContentGrid };

    // Return null if content grid not found
    if (!data.contentGrid) {
      return null;
    }

    return data.contentGrid;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching ContentGrid: ${error.message}`);
    }
    throw new Error('Unknown error fetching ContentGrid');
  }
}

/**
 * Fetches a single ContentGridItem by ID from Contentful
 * @param id - The ID of the ContentGridItem to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to ContentGridItem or null if not found
 */
export async function getContentGridItemById(
  id: string,
  preview = false
): Promise<ContentGridItem | null> {
  try {
    const response = await fetchGraphQL(
      `query GetContentGridItemById($id: String!, $preview: Boolean!) {
        contentGridItem(id: $id, preview: $preview) {
          ${CONTENTGRIDITEM_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { contentGridItem?: ContentGridItem };

    // Return null if content grid item not found
    if (!data.contentGridItem) {
      return null;
    }

    return data.contentGridItem;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching ContentGridItem: ${error.message}`);
    }
    throw new Error('Unknown error fetching ContentGridItem');
  }
}

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
