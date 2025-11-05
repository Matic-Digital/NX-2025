import { fetchGraphQL } from '@/lib/api';
import { ASSET_FIELDS, SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { BANNERHERO_GRAPHQL_FIELDS } from '@/components/BannerHero/BannerHeroApi';
import { CTABANNER_GRAPHQL_FIELDS } from '@/components/CtaBanner/CtaBannerApi';
import { getFooterById } from '@/components/Footer/FooterApi';
import { getHeaderById } from '@/components/Header/HeaderApi';
import { IMAGEBETWEEN_GRAPHQL_FIELDS } from '@/components/ImageBetween/ImageBetweenApi';

import type { Footer } from '@/components/Footer/FooterSchema';
import type { Header } from '@/components/Header/HeaderSchema';
import type { Product } from '@/components/Product/ProductSchema';

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
    ${SYS_FIELDS}
    title
    link
    altText
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
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Product: ${_error.message}`);
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
    case 'Content': {
      // Import Content API dynamically to avoid circular dependencies
      const { getContentById } = await import('@/components/Content/ContentApi');
      const result = await getContentById(id, preview);
      return result?.item || null;
    }
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
    case 'ImageBetween':
      fields = IMAGEBETWEEN_GRAPHQL_FIELDS;
      query = `imageBetween(id: "${id}", preview: ${preview}) { ${fields} }`;
      break;
    case 'Accordion': {
      // Import Accordion fields dynamically to avoid circular dependencies
      const { ACCORDION_GRAPHQL_FIELDS } = await import('@/components/Accordion/AccordionApi');
      fields = ACCORDION_GRAPHQL_FIELDS;
      query = `accordion(id: "${id}", preview: ${preview}) { ${fields} }`;
      break;
    }
    case 'Slider': {
      // Import Slider API dynamically to avoid circular dependencies
      const { getSliderById } = await import('@/components/Slider/SliderApi');
      // Use the Slider API directly instead of raw GraphQL to get server-side enrichment
      return await getSliderById(id, preview);
    }
    case 'Collection': {
      // Import Collection API dynamically to avoid circular dependencies
      const { getCollectionById } = await import('@/components/Collection/CollectionApi');
      return await getCollectionById(id, preview);
    }
    case 'Post': {
      // Import Post API dynamically to avoid circular dependencies
      const { getPostById } = await import('@/components/Post/PostApi');
      return await getPostById(id, preview);
    }
    case 'Profile': {
      // Import Profile API dynamically to avoid circular dependencies
      const { getProfileById } = await import('@/components/Profile/ProfileApi');
      return await getProfileById(id, preview);
    }
    case 'Testimonials': {
      // Import Testimonials API dynamically to avoid circular dependencies
      const { getTestimonialsById } = await import('@/components/Testimonials/TestimonialsApi');
      return await getTestimonialsById(id, preview);
    }
    case 'Event': {
      // Import Event API dynamically to avoid circular dependencies
      const { getEventById } = await import('@/components/Event/EventApi');
      return await getEventById(id, preview);
    }
    default:
      console.warn(`Product API: Unknown component type ${typename}, returning minimal data`);
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
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Product by slug: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Product by slug');
  }
}

export async function getAllProducts(preview = false): Promise<Product[]> {
  try {
    const response = await fetchGraphQL<Product>(
      `query GetAllProducts($preview: Boolean!) {
        productCollection(preview: $preview, order: sys_publishedAt_DESC) {
          items {
            ${PRODUCT_GRAPHQL_FIELDS}
          }
        }
      }`,
      { preview },
      preview
    );

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    const data = response.data as unknown as { productCollection?: { items?: Product[] } };

    if (!data.productCollection?.items?.length) {
      return [];
    }

    return data.productCollection.items;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Products: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Products');
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
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Products: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Products');
  }
}
