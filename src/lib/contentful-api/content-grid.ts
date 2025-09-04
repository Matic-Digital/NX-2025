import { fetchGraphQL } from '../api';

import type { ContentGrid, ContentGridItem, ContentGridResponse } from '@/types/contentful';

import { IMAGE_GRAPHQL_FIELDS } from './image';
import { SYS_FIELDS, ASSET_FIELDS } from './graphql-fields';
import { ContentfulError, NetworkError } from '../errors';

// ContentGridItem fields - minimal for initial load (no link field)
export const CONTENTGRIDITEM_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  heading
  description
  variant
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
    ${SYS_FIELDS}
  }
  backgroundImage {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  itemsCollection(limit: 20) {
    items {
      ... on Accordion {
        ${SYS_FIELDS}
      }
      ... on ContentGridItem {
        ${SYS_FIELDS}
        variant
        image {
          sys {
            id
          }
        }
      }
      ... on CtaGrid {
        ${SYS_FIELDS}
      }
      ... on Image {
        ${SYS_FIELDS}
      }
      ... on OfficeLocation {
        ${SYS_FIELDS}
      }
      ... on Post {
        ${SYS_FIELDS}
      }
      ... on Product {
        ${SYS_FIELDS}
      }
      ... on Service {
        ${SYS_FIELDS}
      }
      ... on Slider {
        ${SYS_FIELDS}
      }
      ... on Solution {
        ${SYS_FIELDS}
      }
      ... on Testimonials {
        ${SYS_FIELDS}
      }
      ... on Video {
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

/**
 * Fetches Collection IDs from a ContentGrid by checking for empty objects
 * @param contentGridId - The ID of the ContentGrid
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to array of Collection IDs
 */
export async function getCollectionIdsFromContentGrid(
  contentGridId: string,
  preview = false
): Promise<string[]> {
  try {
    const response = await fetchGraphQL(
      `query GetContentGridCollectionIds($id: String!, $preview: Boolean!) {
        contentGrid(id: $id, preview: $preview) {
          itemsCollection {
            items {
              ... on Collection {
                sys {
                  id
                }
              }
            }
          }
        }
      }`,
      { id: contentGridId, preview },
      preview
    );

    const data = response?.data as {
      contentGrid?: {
        itemsCollection?: {
          items?: Array<{ sys?: { id?: string } } | null>;
        };
      };
    };

    if (!data?.contentGrid?.itemsCollection?.items) {
      return [];
    }

    const collectionIds: string[] = [];
    for (const item of data.contentGrid.itemsCollection.items) {
      if (item?.sys?.id) {
        collectionIds.push(item.sys.id);
      }
    }

    return collectionIds;
  } catch (error) {
    console.warn('Failed to fetch Collection IDs:', error);
    return [];
  }
}

export async function getContentGridItemById(
  id: string,
  preview = false
): Promise<ContentGridItem | null> {
  try {
    const response = await fetchGraphQL<ContentGridItem>(
      `query GetContentGridItemById($id: String!, $preview: Boolean!) {
        contentGridItem(id: $id, preview: $preview) {
          ${CONTENTGRIDITEM_GRAPHQL_FIELDS}
        }
      }`,
      { id, preview },
      preview
    );

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    const data = response.data as unknown as { contentGridItem?: ContentGridItem };

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
 * Fetches link details for a ContentGridItem by its sys.id
 * @param entryId - The sys.id of the ContentGridItem
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to link details (slug and __typename)
 */
export async function getContentGridItemLink(
  entryId: string,
  preview = false
): Promise<{ link: { slug: string; __typename: string } } | null> {
  try {
    const response = await fetchGraphQL(
      `query GetContentGridItemLink($id: String!, $preview: Boolean!) {
        contentGridItem(id: $id, preview: $preview) {
          link {
            __typename
            ... on Page {
              slug
            }
            ... on PageList {
              slug
            }
            ... on Product {
              slug
            }
          }
        }
      }`,
      { id: entryId, preview },
      preview
    );

    const data = response?.data as {
      contentGridItem?: { link?: { slug?: string; __typename?: string } };
    };
    const linkData = data?.contentGridItem?.link;

    if (linkData?.slug) {
      return {
        link: {
          slug: linkData.slug,
          __typename: linkData.__typename ?? 'Unknown'
        }
      };
    }

    return null;
  } catch {
    // Silently handle GraphQL errors to prevent console spam
    return null;
  }
}
