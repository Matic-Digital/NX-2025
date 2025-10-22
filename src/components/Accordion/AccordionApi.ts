import { fetchGraphQL } from '@/lib/api';
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
  gridVariant
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
    const response = await fetchGraphQL<AccordionItem>(
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
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching AccordionItem: ${error.message}`);
    }
    throw new Error('Unknown error fetching AccordionItem');
  }
}

export async function getAccordionById(
  accordionId: string,
  preview = false
): Promise<Accordion | null> {
  try {
    const response = await fetchGraphQL<Accordion>(
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

    return data.accordionCollection.items[0] ?? null;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Accordion: ${error.message}`);
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
