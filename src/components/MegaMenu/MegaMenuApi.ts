import { fetchGraphQL } from '@/lib/api';
import {
  MENU_ITEM_FIELDS,
  MENU_ITEM_FIELDS_WITH_ASSOCIATED_IMAGE,
  SYS_FIELDS
} from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import type { MegaMenu } from '@/components/MegaMenu/MegaMenuSchema';

export const MEGA_MENU_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  overflow
  title
  contentfulMetadata {
    tags {
      id
      name
    }
  }
  itemsCollection {
    items {
      ${MENU_ITEM_FIELDS}
    }
  }
`;

export const OVERFLOW_MEGA_MENU_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  overflow
  title
  contentfulMetadata {
    tags {
      id
      name
    }
  }
  itemsCollection {
    items {
      ${MENU_ITEM_FIELDS_WITH_ASSOCIATED_IMAGE}
    }
  }
`;

export const MEGA_MENUS_PER_PAGE = 10;

/**
 * Fetches a single mega menu by ID
 * @param id - The ID of the mega menu to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the mega menu or null if not found
 */
export async function getMegaMenuById(id: string, preview = false): Promise<MegaMenu | null> {
  try {
    const response = await fetchGraphQL<MegaMenu>(
      `query GetMegaMenuById($id: String!, $preview: Boolean!) {
        megaMenuCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            ${MEGA_MENU_GRAPHQL_FIELDS}
          }
        }
      }`,
      { id, preview },
      preview
    );

    // Check for valid response
    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to match existing pattern
    const data = response.data as unknown as {
      megaMenuCollection?: { items?: MegaMenu[] };
    };

    // Return null if mega menu not found
    if (!data.megaMenuCollection?.items?.length) {
      return null;
    }

    return data.megaMenuCollection.items[0]!;
  } catch (_error) {
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching mega menu: ${_error.message}`);
    }
    throw new Error('Unknown error fetching mega menu');
  }
}

/**
 * Fetches a single overflow mega menu by ID with associated images
 * @param id - The ID of the mega menu to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the mega menu or null if not found
 */
export async function getOverflowMegaMenuById(
  id: string,
  preview = false
): Promise<MegaMenu | null> {
  try {
    const response = await fetchGraphQL<MegaMenu>(
      `query GetOverflowMegaMenuById($id: String!, $preview: Boolean!) {
        megaMenuCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            ${OVERFLOW_MEGA_MENU_GRAPHQL_FIELDS}
          }
        }
      }`,
      { id, preview },
      preview
    );

    // Check for valid response
    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to match existing pattern
    const data = response.data as unknown as {
      megaMenuCollection?: { items?: MegaMenu[] };
    };

    // Return null if mega menu not found
    if (!data.megaMenuCollection?.items?.length) {
      return null;
    }

    return data.megaMenuCollection.items[0]!;
  } catch (_error) {
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching overflow mega menu: ${_error.message}`);
    }
    throw new Error('Unknown error fetching overflow mega menu');
  }
}
