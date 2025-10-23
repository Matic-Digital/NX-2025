import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { BUTTON_GRAPHQL_FIELDS } from '@/components/Button/ButtonApi';

import type { ContactCard } from '@/components/ContactCard/ContactCardSchema';

// ContactCard GraphQL fields
export const CONTACT_CARD_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  icon
  title
  description
  phone
  email
  cta {
    ${BUTTON_GRAPHQL_FIELDS}
  }
`;

/**
 * Fetches a single ContactCard by ID from Contentful
 * @param id - The ID of the ContactCard to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to ContactCard or null if not found
 */
export async function getContactCardById(id: string, preview = false): Promise<ContactCard | null> {
  try {
    const response = await fetchGraphQL(
      `query GetContactCardById($id: String!, $preview: Boolean!) {
        contactCard(id: $id, preview: $preview) {
          ${CONTACT_CARD_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { contactCard?: ContactCard };

    // Return null if contact card not found
    if (!data.contactCard) {
      return null;
    }

    return data.contactCard;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching ContactCard: ${_error.message}`);
    }
    throw new Error('Unknown error fetching ContactCard');
  }
}
