import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import type { AgendaItem, AgendaItemResponse } from '@/components/AgendaItem/AgendaItemSchema';

// Agenda item fields
export const AGENDA_ITEM_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  time
  description
`;

export async function getAllAgendaItems(preview = false): Promise<AgendaItemResponse> {
  try {
    const response = await fetchGraphQL<AgendaItem>(
      `query GetAllAgendaItems($preview: Boolean!) {
        agendaItemCollection(preview: $preview, order: time_ASC) {
          items {
            ${AGENDA_ITEM_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { agendaItemCollection?: { items?: AgendaItem[] } };

    // Return empty array if no agenda items found
    if (!data.agendaItemCollection?.items) {
      return { items: [] };
    }

    return {
      items: data.agendaItemCollection.items
    };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching agenda items: ${error.message}`);
    }
    throw new Error('Unknown error fetching agenda items');
  }
}

export async function getAgendaItemById(id: string, preview = false): Promise<AgendaItem | null> {
  try {
    const response = await fetchGraphQL<AgendaItem>(
      `query GetAgendaItemById($id: String!, $preview: Boolean!) {
        agendaItemCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            ${AGENDA_ITEM_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { agendaItemCollection?: { items?: AgendaItem[] } };

    // Return null if agenda item not found
    if (!data.agendaItemCollection?.items?.length) {
      return null;
    }

    return data.agendaItemCollection.items[0]!;
  } catch (error) {
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching agenda item by ID: ${error.message}`);
    }
    throw new Error('Unknown error fetching agenda item by ID');
  }
}
