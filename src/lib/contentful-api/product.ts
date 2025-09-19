import { fetchGraphQL } from '../api';
import type { Product } from '@/types/contentful/Product';
import type { Header } from '@/types/contentful/Header';
import type { Footer } from '@/types/contentful/Footer';
import { ContentfulError, NetworkError } from '../errors';
import { getHeaderById } from './header';
import { getFooterById } from './footer';
import { SYS_FIELDS, ASSET_FIELDS } from './graphql-fields';
import { IMAGE_GRAPHQL_FIELDS } from '../../components/Image/ImageApi';
import { BANNERHERO_GRAPHQL_FIELDS } from '../../components/BannerHero/BannerHeroApi';
import { CONTENTGRID_GRAPHQL_FIELDS } from '../../components/ContentGrid/ContentGridApi';
import { CTABANNER_GRAPHQL_FIELDS } from '../../components/CtaBanner/CtaBannerApi';
import { IMAGEBETWEEN_GRAPHQL_FIELDS } from '../../components/ImageBetween/ImageBetweenApi';

// Simplified Product fields for individual Product queries (to stay within Contentful query size limit)
export const PRODUCT_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  slug
  description
  tags
  icon {
    ${ASSET_FIELDS}
  }
  image {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  pageLayout {
    ${SYS_FIELDS}
    header {
      ${SYS_FIELDS}
    }
    footer {
      ${SYS_FIELDS}
    }
  }
  itemsCollection(limit: 10) {
    items {
      __typename
      ... on BannerHero {
        sys {
          id
        }
      }
      ... on Content {
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
      ... on ImageBetween {
        sys {
          id
        }
      }
    }
  }
`;

export async function getProductById(id: string, preview = false): Promise<Product | null> {
  try {
    const response = await fetchGraphQL<Product>(
      `query GetProductById($id: String!, $preview: Boolean!) {
        product(id: $id, preview: $preview) {
          ${PRODUCT_GRAPHQL_FIELDS}
        }   
      }`,
      { id, preview },
      preview
    );

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    const data = response.data as unknown as { product?: Product };

    if (!data.product) {
      return null;
    }

    const product = data.product;

    // Hydrate full content for each component in itemsCollection so components receive required fields
    if (product.itemsCollection?.items) {
      const hydratedItems = await Promise.all(
        product.itemsCollection.items.map(async (item) => {
          if (!item?.__typename || !item.sys?.id) {
            return item;
          }
          const fullComponent = await fetchComponentById(item.sys.id, item.__typename, preview);
          return fullComponent ?? item;
        })
      );

      if (product.itemsCollection) {
        product.itemsCollection.items = hydratedItems as typeof product.itemsCollection.items;
      }
    }

    return product;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Product: ${error.message}`);
    }
    throw new Error('Unknown error fetching Product');
  }
}

// Function to fetch full component data by ID and type
async function fetchComponentById(id: string, typename: string, preview = false): Promise<unknown> {
  let query = '';
  let fields = '';

  switch (typename) {
    case 'BannerHero':
      fields = BANNERHERO_GRAPHQL_FIELDS;
      query = `bannerHero(id: "${id}", preview: ${preview}) { ${fields} }`;
      break;
    case 'Content':
      fields = SYS_FIELDS;
      query = `content(id: "${id}", preview: ${preview}) { ${fields} }`;
      break;
    case 'ContentGrid':
      fields = CONTENTGRID_GRAPHQL_FIELDS;
      query = `contentGrid(id: "${id}", preview: ${preview}) { ${fields} }`;
      break;
    case 'CtaBanner':
      fields = CTABANNER_GRAPHQL_FIELDS;
      query = `ctaBanner(id: "${id}", preview: ${preview}) { ${fields} }`;
      break;
    case 'ImageBetween':
      fields = IMAGEBETWEEN_GRAPHQL_FIELDS;
      query = `imageBetween(id: "${id}", preview: ${preview}) { ${fields} }`;
      break;
    default:
      console.warn(`Unknown component type: ${typename}`);
      return null;
  }

  try {
    const response = await fetchGraphQL(`query { ${query} }`, {}, preview);
    if (!response?.data) return null;

    // Extract the component data based on type
    const data = response.data as Record<string, unknown>;
    const componentKey = typename.charAt(0).toLowerCase() + typename.slice(1); // Convert to camelCase
    return data[componentKey] ?? null;
  } catch (error) {
    console.error(`Error fetching ${typename} component:`, error);
    return null;
  }
}

export async function getProductBySlug(slug: string, preview = false): Promise<Product | null> {
  try {
    // Step 1: Fetch basic Product data
    const response = await fetchGraphQL(
      `query GetProductBySlug($slug: String!, $preview: Boolean!) {
        productCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
          items {
            ${PRODUCT_GRAPHQL_FIELDS}
          }
        }
      }`,
      { slug, preview },
      preview
    );

    // Check for valid response
    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to help TypeScript understand the structure
    const data = response.data as unknown as { productCollection?: { items?: Product[] } };

    // Return null if product not found
    if (!data.productCollection?.items?.length) {
      return null;
    }

    const product = data.productCollection.items[0];
    if (!product) {
      return null;
    }

    // Step 2: Fetch header and footer if pageLayout is present
    let header = null;
    let footer = null;

    if (product.pageLayout) {
      // Type assertion for pageLayout to access nested properties safely
      const pageLayout = product.pageLayout as {
        header?: { sys?: { id: string } };
        footer?: { sys?: { id: string } };
      };

      // Fetch header data if referenced
      if (pageLayout.header?.sys?.id) {
        header = await getHeaderById(pageLayout.header.sys.id, preview);
      }

      // Fetch footer data if referenced
      if (pageLayout.footer?.sys?.id) {
        footer = await getFooterById(pageLayout.footer.sys.id, preview);
      }
    }

    // Step 3: Fetch full content for each component in itemsCollection
    if (product.itemsCollection?.items) {
      const hydratedItems = await Promise.all(
        product.itemsCollection.items.map(async (item) => {
          if (!item?.__typename || !item.sys?.id) {
            return item;
          }

          // Fetch full component data
          const fullComponent = await fetchComponentById(item.sys.id, item.__typename, preview);
          return fullComponent ?? item; // Fallback to basic item if fetch fails
        })
      );

      // Update the product with hydrated components
      if (product.itemsCollection) {
        product.itemsCollection.items = hydratedItems as typeof product.itemsCollection.items;
      }
    }

    // Return product with header and footer data
    return {
      ...product,
      header,
      footer
    } as Product & { header: Header | null; footer: Footer | null };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Product by slug: ${error.message}`);
    }
    throw new Error('Unknown error fetching Product by slug');
  }
}

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
