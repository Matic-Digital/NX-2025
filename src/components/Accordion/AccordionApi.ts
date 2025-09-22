import { SYS_FIELDS } from '../../lib/contentful-api/graphql-fields';
import { fetchGraphQL } from '../../lib/api';
import type { Accordion, AccordionItem } from './AccordionSchema';
import { ContentfulError, NetworkError } from '../../lib/errors';

export const ACCORDION_ITEM_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  overline
  title
  description
  image {
    ${SYS_FIELDS}
  }
  tags
  variant
`;

export const ACCORDION_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  itemsCollection {
    items {
      ... on AccordionItem {
        ${SYS_FIELDS}
      }
    }
  }
`;

export async function getAccordionItemById(
  itemId: string,
  preview = false
): Promise<AccordionItem | null> {
  const query = `
    query GetAccordionItem($id: String!, $preview: Boolean!) {
      accordionItemCollection(where: { sys: { id: $id } }, preview: $preview, limit: 1) {
        items {
          ${ACCORDION_ITEM_GRAPHQL_FIELDS}
        }
      }
    }
  `;

  try {
    const response = await fetchGraphQL(query, { id: itemId, preview });

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to help TypeScript understand the structure
    const data = response.data as unknown as {
      accordionItemCollection?: { items?: AccordionItem[] };
    };

    // Validate the data structure
    if (!data.accordionItemCollection?.items?.length) {
      return null; // Return null if no item found (not an error for single item fetch)
    }

    return data.accordionItemCollection.items[0] ?? null;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`getAccordionItemByIdError: fetching AccordionItem: ${error.message}`);
    }
    throw new Error('getAccordionItemById: Unknown error fetching AccordionItem');
  }
}

export async function getAccordionsByIds(
  accordionIds: string[],
  preview = false
): Promise<Accordion[]> {
  if (accordionIds.length === 0) {
    return [];
  }

  const query = `
    query GetAccordionsByIds($ids: [String!]!, $preview: Boolean!) {
      accordionCollection(where: { sys: { id_in: $ids } }, preview: $preview) {
        items {
          ${ACCORDION_GRAPHQL_FIELDS}
        }
      }
    }
  `;

  try {
    const response = await fetchGraphQL(query, {
      ids: accordionIds,
      preview
    });

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to help TypeScript understand the structure
    const data = response.data as unknown as {
      accordionCollection?: { items?: Accordion[] };
    };

    // Validate the data structure
    if (!data.accordionCollection?.items?.length) {
      throw new ContentfulError('Failed to fetch Accordions from Contentful');
    }

    return data.accordionCollection.items;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`getAccordionsByIdsError: fetching Accordions: ${error.message}`);
    }
    throw new Error('getAccordionsByIds: Unknown error fetching Accordions');
  }
}
