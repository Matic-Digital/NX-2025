import { SYS_FIELDS } from '../../lib/contentful-api/graphql-fields';
import { fetchGraphQL } from '../../lib/api';
import type { Accordion } from './AccordionSchema';
import { ContentfulError, NetworkError } from '../../lib/errors';

export const ACCORDION_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  itemsCollection(limit: 10) {
    items {
      ... on ContentGridItem {
        ${SYS_FIELDS}
        heading
        description
        image {
          ${SYS_FIELDS}
        }
      }
    }
  }
`;

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
