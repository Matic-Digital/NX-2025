import { fetchGraphQL } from '../api';
import type { Product } from '@/types/contentful/Product';
import { ContentfulError, NetworkError } from '../errors';
import { SYS_FIELDS, ASSET_FIELDS } from './graphql-fields';

// Product fields
export const PRODUCT_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  slug
  icon {
    ${ASSET_FIELDS}
  }
  description
`;

export async function getProductsByIds(productsIds: string[], preview = false): Promise<Product[]> {
  if (productsIds.length === 0) {
    return [];
  }

  const query = `
    query GetProductsByIds($ids: [String!]!, $preview: Boolean!) {
      productCollection(where: { sys: { id_in: $ids } }, preview: $preview) {
        items {
          ${PRODUCT_GRAPHQL_FIELDS}
        }
      }
    }
  `;

  try {
    const response = await fetchGraphQL(query, {
      ids: productsIds,
      preview
    });

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to help TypeScript understand the structure
    const data = response.data as unknown as {
      productCollection?: { items?: Product[] };
    };

    // Validate the data structure
    if (!data.productCollection?.items?.length) {
      throw new ContentfulError('Failed to fetch Products from Contentful');
    }

    return data.productCollection.items;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Products: ${error.message}`);
    }
    throw new Error('Unknown error fetching Products');
  }
}
