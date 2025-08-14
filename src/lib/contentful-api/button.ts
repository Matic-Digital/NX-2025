import { fetchGraphQL } from '../api';
import type { Button } from '@/types/contentful';
import { ContentfulError, NetworkError } from '../errors';
import { SYS_FIELDS } from './graphql-fields';

// Button fields
export const BUTTON_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  internalText
  text
  internalLink {
    ... on Page {
      sys {
        id
      }
      slug
    }
    ... on PageList {
      sys {
        id
      }
      slug
    }
    ... on Product {
      sys {
        id
      }
      slug
    }
  }
  externalLink
  modal {
    sys {
      id
    }
    title
    description
  }
`;

export const BUTTONS_PER_PAGE = 10;

/**
 * Fetches all buttons from Contentful
 * @param preview - Whether to fetch draft content
 * @param limit - Maximum number of buttons to fetch
 * @param skip - Number of buttons to skip for pagination
 * @returns Promise resolving to buttons response with pagination info
 */
export async function getAllButtons(
  preview = false,
  limit = BUTTONS_PER_PAGE,
  skip = 0
): Promise<{ items: Button[]; total: number }> {
  try {
    const response = await fetchGraphQL<Button>(
      `query GetAllButtons($preview: Boolean!, $limit: Int!, $skip: Int!) {
        buttonCollection(preview: $preview, limit: $limit, skip: $skip) {
          items {
            ${BUTTON_GRAPHQL_FIELDS}
          }
          total
        }
      }`,
      { preview, limit, skip },
      preview
    );

    // Check for valid response
    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to help TypeScript understand the structure
    const data = response.data as unknown as {
      buttonCollection?: { items?: Button[]; total?: number };
    };

    // Validate the data structure
    if (!data.buttonCollection?.items?.length) {
      throw new ContentfulError('Failed to fetch buttons from Contentful');
    }

    return {
      items: data.buttonCollection.items,
      total: data.buttonCollection.total ?? 0
    };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching buttons: ${error.message}`);
    }
    throw new Error('Unknown error fetching buttons');
  }
}

/**
 * Fetches a single button by ID
 * @param id - The ID of the button to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the button or null if not found
 */
export async function getButtonById(id: string, preview = false): Promise<Button | null> {
  try {
    const response = await fetchGraphQL<Button>(
      `query GetButtonById($id: String!, $preview: Boolean!) {
        buttonCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            ${BUTTON_GRAPHQL_FIELDS}
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

    // Access data using type assertion to help TypeScript understand the structure
    const data = response.data as unknown as { buttonCollection?: { items?: Button[] } };

    // Return null if button not found
    if (!data.buttonCollection?.items?.length) {
      return null;
    }

    return data.buttonCollection.items[0]!;
  } catch (error) {
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching button: ${error.message}`);
    }
    throw new Error('Unknown error fetching button');
  }
}
