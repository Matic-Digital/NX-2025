import { fetchGraphQL } from '../../lib/api';
import { ContentfulError, NetworkError } from '../../lib/errors';
import { SYS_FIELDS } from '../../lib/contentful-api/graphql-fields';
import type { Button } from './ButtonSchema';

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
  icon
`;

export const BUTTONS_PER_PAGE = 10;

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

    // Access data using type assertion to match existing pattern
    const data = response.data as unknown as {
      buttonCollection?: { items?: Button[] };
    };

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
