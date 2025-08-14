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

export async function getSolutionById(id: string, preview = false): Promise<Solution | null> {
  try {
    const response = await fetchGraphQL<Solution>(
      `query GetSolutionById($id: String!, $preview: Boolean!) {
        solution(id: $id, preview: $preview) {
          ${SOLUTION_GRAPHQL_FIELDS}
        }
      }`,
      { id, preview },
      preview
    );

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    const data = response.data as unknown as { solution?: Solution };

    if (!data.solution) {
      return null;
    }

    return data.solution;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Solution: ${error.message}`);
    }
    throw new Error('Unknown error fetching Solution');
  }
}

export async function getSolutionBySlug(slug: string, preview = false): Promise<Solution | null> {
  try {
    const response = await fetchGraphQL<Solution>(
      `query GetSolutionBySlug($slug: String!, $preview: Boolean!) {
        solutionCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
          items {
            ${SOLUTION_GRAPHQL_FIELDS}
          }
        }
      }`,
      { slug, preview },
      preview
    );

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    const data = response.data as unknown as { solutionCollection?: { items?: Solution[] } };

    if (!data.solutionCollection?.items?.length) {
      return null;
    }

    const solution = data.solutionCollection.items[0];
    if (!solution) {
      return null;
    }

    return solution;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Solution by slug: ${error.message}`);
    }
    throw new Error('Unknown error fetching Solution by slug');
  }
}

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
    const response = await fetchGraphQL<Solution>(query, {
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
