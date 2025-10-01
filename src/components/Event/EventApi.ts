import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import type { Event } from '@/components/Event/EventSchema';

export const EVENT_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  dateTime
  link {
    ${SYS_FIELDS}
    __typename
    ... on Page {
      slug
    }
  }
`;

export async function getEventById(id: string, preview = false): Promise<Event | null> {
  try {
    const response = await fetchGraphQL(
      `query GetEventById($id: String!, $preview: Boolean!) {
        event(id: $id, preview: $preview) {
          ${EVENT_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { event?: Event };

    // Return null if event not found
    if (!data.event) {
      return null;
    }
    return data.event;
  } catch (error) {
    console.error('❌ Error in getEventById:', error);
    if (error instanceof ContentfulError) {
      console.error('ContentfulError:', error.message);
      throw error;
    }
    if (error instanceof Error) {
      console.error('NetworkError:', error.message);
      throw new NetworkError(`Error fetching Event: ${error.message}`);
    }
    console.error('Unknown error type:', error);
    throw new Error('Unknown error fetching Event');
  }
}
