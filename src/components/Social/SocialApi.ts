import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import type { Social, SocialResponse } from '@/types';

// Social fields
export const SOCIAL_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  link
  icon {
    url
    title
    width
    height
  }
`;

export const SOCIALS_PER_PAGE = 10;

/**
 * Fetches all socials from Contentful
 * @param preview - Whether to fetch draft content
 * @param limit - Maximum number of socials to fetch
 * @param skip - Number of socials to skip for pagination
 * @returns Promise resolving to socials response with pagination info
 */
export async function getAllSocials(
  preview = false,
  limit = SOCIALS_PER_PAGE,
  skip = 0
): Promise<SocialResponse> {
  try {
    const response = await fetchGraphQL<Social>(
      `query GetAllSocials($preview: Boolean!, $limit: Int!, $skip: Int!) {
        socialCollection(preview: $preview, limit: $limit, skip: $skip) {
          items {
            ${SOCIAL_GRAPHQL_FIELDS}
          }
          total
        }
      }`,
      { preview, limit, skip },
      preview
    );

    // Check for valid response
    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to help TypeScript understand the structure
    const data = response.data as unknown as {
      socialCollection?: { items?: Social[]; total?: number };
    };

    // Validate the data structure
    if (!data.socialCollection?.items?.length) {
      throw new ContentfulError('Failed to fetch socials from Contentful');
    }

    return {
      items: data.socialCollection.items,
      total: data.socialCollection.total ?? 0
    };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching socials: ${error.message}`);
    }
    throw new Error('Unknown error fetching socials');
  }
}

/**
 * Fetches a single social by ID
 * @param id - The ID of the social to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the social or null if not found
 */
export async function getSocialById(id: string, preview = false): Promise<Social | null> {
  try {
    const response = await fetchGraphQL<Social>(
      `query GetSocialById($id: String!, $preview: Boolean!) {
        socialCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            ${SOCIAL_GRAPHQL_FIELDS}
          }
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
    const data = response.data as unknown as { socialCollection?: { items?: Social[] } };

    // Return null if social not found
    if (!data.socialCollection?.items?.length) {
      return null;
    }

    return data.socialCollection.items[0]!;
  } catch (error) {
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching social: ${error.message}`);
    }
    throw new Error('Unknown error fetching social');
  }
}
