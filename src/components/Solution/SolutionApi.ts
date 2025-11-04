import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { BANNERHERO_GRAPHQL_FIELDS } from '@/components/BannerHero/BannerHeroApi';
import { BUTTON_GRAPHQL_FIELDS } from '@/components/Button/ButtonApi';
import { CTABANNER_GRAPHQL_FIELDS } from '@/components/CtaBanner/CtaBannerApi';

import type { Solution } from '@/components/Solution/SolutionSchema';

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
    ${SYS_FIELDS}
    title
    link
    altText
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
      ... on CtaBanner {
        sys {
          id
        }
      }
      ... on Content {
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
    case 'ContentGrid': {
      // Import ContentGrid API dynamically to avoid circular dependencies
      const { getContentGridItemById } = await import('@/components/ContentGrid/ContentGridApi');
      // Use the ContentGrid API directly instead of raw GraphQL to get server-side enrichment
      return await getContentGridItemById(id, preview);
    }
    case 'CtaBanner':
      fields = CTABANNER_GRAPHQL_FIELDS;
      query = `ctaBanner(id: "${id}", preview: ${preview}) { ${fields} }`;
      break;
    case 'Slider': {
      // Import Slider API dynamically to avoid circular dependencies
      const { getSliderById } = await import('@/components/Slider/SliderApi');
      // Use the Slider API directly instead of raw GraphQL to get server-side enrichment
      return await getSliderById(id, preview);
    }
    case 'Accordion': {
      // Import Accordion fields dynamically to avoid circular dependencies
      const { ACCORDION_GRAPHQL_FIELDS } = await import('@/components/Accordion/AccordionApi');
      fields = ACCORDION_GRAPHQL_FIELDS;
      query = `accordion(id: "${id}", preview: ${preview}) { ${fields} }`;
      break;
    }
    case 'ImageBetween': {
      // Import ImageBetween fields dynamically to avoid circular dependencies
      const { IMAGEBETWEEN_GRAPHQL_FIELDS } = await import('@/components/ImageBetween/ImageBetweenApi');
      fields = IMAGEBETWEEN_GRAPHQL_FIELDS;
      query = `imageBetween(id: "${id}", preview: ${preview}) { ${fields} }`;
      break;
    }
    case 'Content': {
      // Import Content API dynamically to avoid circular dependencies
      const { getContentById } = await import('@/components/Content/ContentApi');
      return await getContentById(id, preview);
    }
    default:
      return null;
  }

  try {
    const response = await fetchGraphQL(`query { ${query} }`, {}, preview);
    if (!response?.data) return null;

    // Extract the component data based on type
    const data = response.data as Record<string, unknown>;
    const componentKey = typename.charAt(0).toLowerCase() + typename.slice(1); // Convert to camelCase
    // eslint-disable-next-line security/detect-object-injection
    return Object.prototype.hasOwnProperty.call(data, componentKey) ? data[componentKey] : null;
  } catch {
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
        solution.itemsCollection.items = hydratedItems as typeof solution.itemsCollection.items;
      }
    }

    return solution;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Solution: ${_error.message}`);
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
        solution.itemsCollection.items = hydratedItems as typeof solution.itemsCollection.items;
      }
    }

    return solution;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Solution by slug: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Solution by slug');
  }
}

export async function getAllSolutions(preview = false): Promise<Solution[]> {
  try {
    const response = await fetchGraphQL<Solution>(
      `query GetAllSolutions($preview: Boolean!) {
        solutionCollection(preview: $preview, order: sys_publishedAt_DESC) {
          items {
            ${SOLUTION_GRAPHQL_FIELDS}
          }
        }
      }`,
      { preview },
      preview
    );

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    const data = response.data as unknown as { solutionCollection?: { items?: Solution[] } };

    if (!data.solutionCollection?.items?.length) {
      return [];
    }

    return data.solutionCollection.items;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Solutions: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Solutions');
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
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Solutions: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Solutions');
  }
}
