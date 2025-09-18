/* eslint-disable @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-unsafe-assignment */

import { fetchGraphQL } from '../api';
import { SYS_FIELDS } from './graphql-fields';
import { BANNERHERO_GRAPHQL_FIELDS } from './banner-hero';
import { CONTENTGRID_GRAPHQL_FIELDS } from './content-grid';
import { BUTTON_GRAPHQL_FIELDS } from './button';
import { IMAGE_GRAPHQL_FIELDS } from './image';

import type { Solution } from '@/types/contentful';

import { ContentfulError, NetworkError } from '../errors';

// Basic Solution fields for use in sliders and lists
export const SOLUTION_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  slug
  heading
  subheading
  cardTitle
  description
  backgroundImage {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  cta {
    ${BUTTON_GRAPHQL_FIELDS}
  }
  variant
`;

// Extended Solution fields for individual Solution pages with content items (lazy loading)
export const SOLUTION_GRAPHQL_FIELDS_FULL = `
  ${SOLUTION_GRAPHQL_FIELDS}
  itemsCollection(limit: 10) {
    items {
      __typename
      ... on BannerHero {
        sys {
          id
        }
      }
      ... on ContentGrid {
        sys {
          id
        }
      }
    }
  }
`;

// Function to fetch full component data by ID and type
async function fetchComponentById(id: string, typename: string, preview = false): Promise<unknown> {
  let query = '';
  let fields = '';

  switch (typename) {
    case 'BannerHero':
      fields = BANNERHERO_GRAPHQL_FIELDS;
      query = `bannerHero(id: "${id}", preview: ${preview}) { ${fields} }`;
      break;
    case 'ContentGrid':
      fields = CONTENTGRID_GRAPHQL_FIELDS;
      query = `contentGrid(id: "${id}", preview: ${preview}) { ${fields} }`;
      break;
    default:
      console.warn(`Unknown component type: ${typename}`);
      return null;
  }

  try {
    const response = await fetchGraphQL(`query { ${query} }`, {}, preview);
    if (!response?.data) return null;

    // Extract the component data based on type
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = response.data as Record<string, unknown>;
    const componentKey = typename.charAt(0).toLowerCase() + typename.slice(1); // Convert to camelCase
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data[componentKey] ?? null;
  } catch (error) {
    console.error(`Error fetching ${typename} component:`, error);
    return null;
  }
}

export async function getSolutionById(id: string, preview = false): Promise<Solution | null> {
  try {
    const response = await fetchGraphQL<Solution>(
      `query GetSolutionById($id: String!, $preview: Boolean!) {
        solution(id: $id, preview: $preview) {
          ${SOLUTION_GRAPHQL_FIELDS_FULL}
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

    const solution = data.solution;

    // Hydrate full content for each component in itemsCollection so components receive required fields
    if (solution.itemsCollection?.items) {
      const hydratedItems = await Promise.all(
        solution.itemsCollection.items.map(async (item) => {
          const typedItem = item as { __typename?: string; sys?: { id?: string } };
          if (!typedItem?.__typename || !typedItem.sys?.id) {
            return item;
          }
          const fullComponent = await fetchComponentById(
            typedItem.sys.id,
            typedItem.__typename,
            preview
          );
          return fullComponent ?? item;
        })
      );

      if (solution.itemsCollection) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        solution.itemsCollection.items = hydratedItems as typeof solution.itemsCollection.items;
      }
    }

    return solution;
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
            ${SOLUTION_GRAPHQL_FIELDS_FULL}
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

    // Hydrate full content for each component in itemsCollection so components receive required fields
    if (solution.itemsCollection?.items) {
      const hydratedItems = await Promise.all(
        solution.itemsCollection.items.map(async (item) => {
          const typedItem = item as { __typename?: string; sys?: { id?: string } };
          if (!typedItem?.__typename || !typedItem.sys?.id) {
            return item;
          }
          const fullComponent = await fetchComponentById(
            typedItem.sys.id,
            typedItem.__typename,
            preview
          );
          return fullComponent ?? item;
        })
      );

      if (solution.itemsCollection) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        solution.itemsCollection.items = hydratedItems as typeof solution.itemsCollection.items;
      }
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
