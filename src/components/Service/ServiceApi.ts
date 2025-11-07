import { fetchGraphQL } from '@/lib/api';
import { getCacheConfig } from '@/lib/cache-tags';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { BANNERHERO_GRAPHQL_FIELDS } from '@/components/BannerHero/BannerHeroApi';
import { CTABANNER_GRAPHQL_FIELDS } from '@/components/CtaBanner/CtaBannerApi';

import type { Service, ServiceResponse } from '@/components/Service/ServiceSchema';

// Service fields
export const SERVICE_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  slug
  description
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
      ... on Entry {
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
      const result = await getContentById(id, preview);
      return result?.item || null;
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

export async function getAllServices(preview = false): Promise<ServiceResponse> {
  try {
    const response = await fetchGraphQL<Service>(
      `query GetAllServices($preview: Boolean!) {
        serviceCollection(preview: $preview, order: sys_publishedAt_DESC) {
          items {
            ${SERVICE_GRAPHQL_FIELDS}
          }
        }
      }`,
      { preview },
      preview
    );

    // Check for valid response
    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to help TypeScript understand the structure
    const data = response.data as unknown as { serviceCollection?: { items?: Service[] } };

    // Validate the data structure
    if (!data.serviceCollection?.items?.length) {
      throw new ContentfulError('Failed to fetch Services from Contentful');
    }

    return {
      items: data.serviceCollection.items
    };
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Services: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Services');
  }
}

/**
 * Fetches a single Service by ID from Contentful
 * @param id - The ID of the Service to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to Service or null if not found
 */
export async function getServiceById(id: string, preview = false): Promise<Service | null> {
  try {
    const response = await fetchGraphQL<Service>(
      `query GetServiceById($id: String!, $preview: Boolean!) {
        service(id: $id, preview: $preview) {
          ${SERVICE_GRAPHQL_FIELDS}
        }
      }`,
      { id, preview },
      preview
    );

    // Check for valid response
    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to help TypeScript understand the structure
    const data = response.data as unknown as { service?: Service };

    // Return null if service not found
    if (!data.service) {
      return null;
    }

    const service = data.service;

    // Step 2: Fetch header and footer if pageLayout is present
    let header = null;
    let footer = null;

    if (service.pageLayout) {
      // Type assertion for pageLayout to access nested properties safely
      const pageLayout = service.pageLayout as { header?: { sys?: { id?: string } }; footer?: { sys?: { id?: string } } };

      // Fetch header and footer in parallel
      const [headerResponse, footerResponse] = await Promise.all([
        pageLayout.header?.sys?.id
          ? (async () => {
              const { getHeaderById } = await import('@/components/Header/HeaderApi');
              return getHeaderById(pageLayout.header!.sys!.id!, preview);
            })()
          : Promise.resolve(null),
        pageLayout.footer?.sys?.id
          ? (async () => {
              const { getFooterById } = await import('@/components/Footer/FooterApi');
              return getFooterById(pageLayout.footer!.sys!.id!, preview);
            })()
          : Promise.resolve(null),
      ]);

      header = headerResponse;
      footer = footerResponse;
    }

    // Step 3: Enrich itemsCollection components with full data (server-side lazy loading)
    if (service.itemsCollection?.items?.length && service.itemsCollection.items.length > 0) {
      const enrichedItems = await Promise.all(
        service.itemsCollection.items.map(async (item, _index) => {
          if (!item?.sys?.id || !item.__typename) {
            return item;
          }

          try {
            const fullComponent = await fetchComponentById(item.sys.id, item.__typename, preview);
            return fullComponent ?? item;
          } catch {
            return item;
          }
        })
      );

      service.itemsCollection.items = enrichedItems as typeof service.itemsCollection.items;
    }

    // Return the enriched service with header and footer
    return {
      ...service,
      pageLayout: service.pageLayout
        ? {
            ...service.pageLayout,
            header,
            footer,
          }
        : undefined,
    };
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Service: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Service');
  }
}

/**
 * Fetches a single Service by slug from Contentful
 * @param slug - The slug of the Service to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to Service or null if not found
 */
export async function getServiceBySlug(slug: string, preview = false): Promise<Service | null> {
  try {
    // Generate cache configuration with proper tags
    const cacheConfig = getCacheConfig('Service', { slug, id: undefined });
    
    const response = await fetchGraphQL<Service>(
      `query GetServiceBySlug($slug: String!, $preview: Boolean!) {
        serviceCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
          items {
            ${SERVICE_GRAPHQL_FIELDS}
          }
        }
      }`,
      { slug, preview },
      preview,
      cacheConfig
    );

    // Check for valid response
    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to help TypeScript understand the structure
    const data = response.data as unknown as { serviceCollection?: { items?: Service[] } };

    // Return null if post not found
    if (!data.serviceCollection?.items?.length) {
      return null;
    }

    const service = data.serviceCollection.items[0];
    if (!service) {
      return null;
    }

    // Step 2: Fetch header and footer if pageLayout is present
    let header = null;
    let footer = null;

    if (service.pageLayout) {
      // Type assertion for pageLayout to access nested properties safely
      const pageLayout = service.pageLayout as { header?: { sys?: { id?: string } }; footer?: { sys?: { id?: string } } };

      // Fetch header and footer in parallel
      const [headerResponse, footerResponse] = await Promise.all([
        pageLayout.header?.sys?.id
          ? (async () => {
              const { getHeaderById } = await import('@/components/Header/HeaderApi');
              return getHeaderById(pageLayout.header!.sys!.id!, preview);
            })()
          : Promise.resolve(null),
        pageLayout.footer?.sys?.id
          ? (async () => {
              const { getFooterById } = await import('@/components/Footer/FooterApi');
              return getFooterById(pageLayout.footer!.sys!.id!, preview);
            })()
          : Promise.resolve(null),
      ]);

      header = headerResponse;
      footer = footerResponse;
    }

    // Step 3: Enrich itemsCollection components with full data (server-side lazy loading)
    if (service.itemsCollection?.items?.length && service.itemsCollection.items.length > 0) {
      const enrichedItems = await Promise.all(
        service.itemsCollection.items.map(async (item, _index) => {
          if (!item?.sys?.id || !item.__typename) {
            return item;
          }

          try {
            const fullComponent = await fetchComponentById(item.sys.id, item.__typename, preview);
            return fullComponent ?? item;
          } catch {
            return item;
          }
        })
      );

      service.itemsCollection.items = enrichedItems as typeof service.itemsCollection.items;
    }

    // Return the enriched service with header and footer
    return {
      ...service,
      pageLayout: service.pageLayout
        ? {
            ...service.pageLayout,
            header,
            footer,
          }
        : undefined,
    };
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Service by slug: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Service by slug');
  }
}
