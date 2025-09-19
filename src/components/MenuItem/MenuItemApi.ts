import { fetchGraphQL } from '@/lib/api';
import { ContentfulError, NetworkError } from '@/lib/errors';
import { MENU_ITEM_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import type { MenuItem } from './MenuItemSchema';

export const MENU_ITEM_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  ${MENU_ITEM_FIELDS}
`;

export const MENU_ITEMS_PER_PAGE = 10;

/**
 * Fetches a single menu item by ID
 * @param id - The ID of the menu item to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the menu item or null if not found
 */
export async function getMenuItemById(id: string, preview = false): Promise<MenuItem | null> {
  try {
    const response = await fetchGraphQL<MenuItem>(
      `query GetMenuItemById($id: String!, $preview: Boolean!) {
        menuItemCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            ${MENU_ITEM_FIELDS}
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
      menuItemCollection?: { items?: MenuItem[] };
    };

    // Return null if menu item not found
    if (!data.menuItemCollection?.items?.length) {
      return null;
    }

    return data.menuItemCollection.items[0]!;
  } catch (error) {
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching menu item: ${error.message}`);
    }
    throw new Error('Unknown error fetching menu item');
  }
}
