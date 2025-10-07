import { fetchGraphQL } from '@/lib/api';
import { MENU_ITEM_FIELDS, SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import type { Menu } from '@/components/Menu/MenuSchema';

export const MENU_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  itemsCollection(limit: 20) {
    items {
      ... on MenuItem {
        ${MENU_ITEM_FIELDS}
      }
      ... on MegaMenu {
        ${SYS_FIELDS}
        overflow
        title
      }
    }
  }
`;

export const MENUS_PER_PAGE = 10;

/**
 * Fetches a single menu by ID
 * @param id - The ID of the menu to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the menu or null if not found
 */
export async function getMenuById(id: string, preview = false): Promise<Menu | null> {
  try {
    const response = await fetchGraphQL<Menu>(
      `query GetMenuById($id: String!, $preview: Boolean!) {
        menuCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            ${MENU_GRAPHQL_FIELDS}
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
      menuCollection?: { items?: Menu[] };
    };

    // Return null if menu not found
    if (!data.menuCollection?.items?.length) {
      return null;
    }

    return data.menuCollection.items[0]!;
  } catch (error) {
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching menu: ${error.message}`);
    }
    throw new Error('Unknown error fetching menu');
  }
}
