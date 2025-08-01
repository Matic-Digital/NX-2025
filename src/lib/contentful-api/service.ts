import { fetchGraphQL } from '../api';

import type { Service, ServiceResponse } from '@/types/contentful/Service';

import { ContentfulError, NetworkError } from '../errors';
import { IMAGE_GRAPHQL_FIELDS } from './image';

const SYS_FIELDS = `
  sys {
    id
  }
  __typename
`;

// Service fields
export const SERVICE_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  slug
  cardImage {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  cardTitle
  cardTags
  cardButtonText
`;

export async function getAllServices(preview = false): Promise<ServiceResponse> {
  try {
    const response = await fetchGraphQL<Service>(
      `query GetAllServices($preview: Boolean!) {
        serviceCollection(preview: $preview, order: datePublished_DESC) {
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
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Services: ${error.message}`);
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

    // Return null if post not found
    if (!data.service) {
      return null;
    }

    return data.service;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Service: ${error.message}`);
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
    const response = await fetchGraphQL<Service>(
      `query GetServiceBySlug($slug: String!, $preview: Boolean!) {
        serviceCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
          items {
            ${SERVICE_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { serviceCollection?: { items?: Service[] } };

    // Return null if post not found
    if (!data.serviceCollection?.items?.length) {
      return null;
    }

    const service = data.serviceCollection.items[0];
    if (!service) {
      return null;
    }

    return service;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Service by slug: ${error.message}`);
    }
    throw new Error('Unknown error fetching Service by slug');
  }
}
