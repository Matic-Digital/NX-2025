import { fetchGraphQLMemoized } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { BUTTON_GRAPHQL_FIELDS } from '@/components/Button/ButtonApi';

import type { Accordion, AccordionItem } from '@/components/Accordion/AccordionSchema';

export const ACCORDION_ITEM_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  overline
  title
  description
  variant
  tags
  image {
    ${SYS_FIELDS}
  }
  backgroundImage {
    ${SYS_FIELDS}
    link
  }
  cta {
    ${BUTTON_GRAPHQL_FIELDS}
  }
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
  id: string,
  preview = false
): Promise<AccordionItem | null> {
  try {
    const response = await fetchGraphQLMemoized<AccordionItem>(
      `query GetAccordionItemById($id: String!, $preview: Boolean!) {
        accordionItem(id: $id, preview: $preview) {
          ${ACCORDION_ITEM_GRAPHQL_FIELDS}
        }
      }`,
      { id, preview },
      preview
    );

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    const data = response.data as unknown as { accordionItem?: AccordionItem };

    if (!data.accordionItem) {
      return null;
    }

    return data.accordionItem;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching AccordionItem: ${_error.message}`);
    }
    throw new Error('Unknown error fetching AccordionItem');
  }
}

export async function getAccordionById(
  accordionId: string,
  preview = false
): Promise<Accordion | null> {
  try {
    const response = await fetchGraphQLMemoized<Accordion>(
      `query GetAccordionById($id: String!, $preview: Boolean!) {
        accordionCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            ${ACCORDION_GRAPHQL_FIELDS}
          }
        }
      }`,
      { id: accordionId, preview },
      preview
    );

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    const data = response.data as unknown as { accordionCollection?: { items?: Accordion[] } };

    if (!data.accordionCollection?.items?.length) {
      return null;
    }

    const accordion = data.accordionCollection.items[0];
    if (!accordion) {
      return null;
    }

    // Step 2: Enrich accordion items with full data (server-side lazy loading)
    if (accordion.itemsCollection?.items?.length > 0) {
      console.log('Accordion API: Enriching', accordion.itemsCollection.items.length, 'accordion items');
      const enrichmentPromises = accordion.itemsCollection.items.map(async (item: any) => {
        if (item.sys?.id) {
          try {
            console.log('Accordion API: Enriching AccordionItem', item.sys.id);
            const enrichedItem = await getAccordionItemById(item.sys.id, preview);
            console.log('Accordion API: AccordionItem enriched:', {
              id: item.sys.id,
              hasEnrichedData: !!enrichedItem,
              hasTitle: !!enrichedItem?.title
            });
            return enrichedItem || item;
          } catch (error) {
            console.warn(`Failed to enrich AccordionItem ${item.sys.id}:`, error);
            return item;
          }
        }
        return item;
      });

      const enrichedItems = await Promise.all(enrichmentPromises);
      accordion.itemsCollection.items = enrichedItems.filter(item => item !== null);
    }

    return accordion;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Accordion: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Accordion');
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
    const response = await fetchGraphQLMemoized(query, {
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

    const accordions = data.accordionCollection.items;

    // Step 2: Enrich accordion items in all accordions (server-side lazy loading)
    const enrichedAccordions = await Promise.all(
      accordions.map(async (accordion: any) => {
        if (accordion.itemsCollection?.items?.length > 0) {
          console.log('Accordion Collection API: Enriching', accordion.itemsCollection.items.length, 'accordion items for', accordion.sys.id);
          const enrichmentPromises = accordion.itemsCollection.items.map(async (item: any) => {
            if (item.sys?.id) {
              try {
                const enrichedItem = await getAccordionItemById(item.sys.id, preview);
                return enrichedItem || item;
              } catch (error) {
                console.warn(`Failed to enrich AccordionItem ${item.sys.id}:`, error);
                return item;
              }
            }
            return item;
          });

          const enrichedItems = await Promise.all(enrichmentPromises);
          accordion.itemsCollection.items = enrichedItems.filter(item => item !== null);
        }
        return accordion;
      })
    );

    return enrichedAccordions;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`getAccordionsByIdsError: fetching Accordions: ${_error.message}`);
    }
    throw new Error('getAccordionsByIds: Unknown error fetching Accordions');
  }
}
