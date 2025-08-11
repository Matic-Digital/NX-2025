import { fetchGraphQL } from '../api';
import { IMAGE_GRAPHQL_FIELDS } from './image';
import { SYS_FIELDS } from './graphql-fields';

import type { Solution } from '@/types/contentful';

import { ContentfulError, NetworkError } from '../errors';

// Solution fields
export const SOLUTION_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  slug
  cardHeading
  cardSubheading
  cardTitle
  cardDescription
  cardBackgroundImage {
    ${IMAGE_GRAPHQL_FIELDS}
  }
`;

export async function getSolutionsByIds(
  solutionsIds: string[],
  preview = false
): Promise<Solution[]> {
  if (solutionsIds.length === 0) {
    return [];
  }

  const query = `
    query GetSolutionsByIds($ids: [String!]!, $preview: Boolean!) {
      solutionCollection(where: { sys: { id_in: $ids } }, preview: $preview) {
        items {
          ${SOLUTION_GRAPHQL_FIELDS}
        }
      }
    }
  `;

  try {
    const response = await fetchGraphQL(query, {
      ids: solutionsIds,
      preview
    });

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to help TypeScript understand the structure
    const data = response.data as unknown as {
      solutionCollection?: { items?: Solution[] };
    };

    // Validate the data structure
    if (!data.solutionCollection?.items?.length) {
      throw new ContentfulError('Failed to fetch Solutions from Contentful');
    }

    return data.solutionCollection.items;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Solutions: ${error.message}`);
    }
    throw new Error('Unknown error fetching Solutions');
  }
}
