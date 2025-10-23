import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { IMAGE_GRAPHQL_FIELDS } from '@/components/Image/ImageApi';

import type { Profile, ProfileResponse } from '@/components/Profile/ProfileSchema';

// Profile fields for GraphQL queries
export const PROFILE_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  asset {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  name
  profileLocation
  description
`;

// Simple profile fields (for embedded content)
export const PROFILE_SIMPLE_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  name
  profileLocation
  description
`;

/**
 * Fetches all Profiles from Contentful
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to Profiles response
 */
export async function getAllProfiles(preview = false): Promise<ProfileResponse> {
  try {
    const response = await fetchGraphQL<Profile>(
      `query GetAllProfiles($preview: Boolean!) {
        profileCollection(preview: $preview) {
          items {
            ${PROFILE_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { profileCollection?: { items?: Profile[] } };

    // Return empty array if no profiles found
    if (!data.profileCollection?.items) {
      return { items: [] };
    }

    return {
      items: data.profileCollection.items
    };
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Profiles: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Profiles');
  }
}

/**
 * Fetches a single Profile by ID from Contentful
 * @param id - The ID of the Profile to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to Profile or null if not found
 */
export async function getProfileById(id: string, preview = false): Promise<Profile | null> {
  try {
    const response = await fetchGraphQL<Profile>(
      `query GetProfileById($id: String!, $preview: Boolean!) {
        profile(id: $id, preview: $preview) {
          ${PROFILE_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { profile?: Profile };

    // Return null if profile not found
    if (!data.profile) {
      return null;
    }

    return data.profile;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Profile: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Profile');
  }
}
