import { fetchGraphQL } from '../api';
import type { TeamMember, TeamMemberResponse } from '@/types/contentful';
import { ContentfulError, NetworkError } from '../errors';
import { SYS_FIELDS } from './graphql-fields';
import { IMAGE_GRAPHQL_FIELDS } from '../../components/Image/ImageApi';

// Team member fields
export const TEAM_MEMBER_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  name
  jobTitle
  image {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  bio {
    json
  }
  email
  linkedIn
`;

export const TEAM_MEMBER_SIMPLE_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  name
  jobTitle
  bio {
    json
  }
  `;

export async function getAllTeamMembers(preview = false): Promise<TeamMemberResponse> {
  try {
    const response = await fetchGraphQL<TeamMember>(
      `query GetAllTeamMembers($preview: Boolean!) {
        teamMemberCollection(preview: $preview) {
          items {
            ${TEAM_MEMBER_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { teamMemberCollection?: { items?: TeamMember[] } };

    // Validate the data structure
    if (!data.teamMemberCollection?.items?.length) {
      throw new ContentfulError('Failed to fetch team members from Contentful');
    }

    return {
      items: data.teamMemberCollection.items
    };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching team members: ${error.message}`);
    }
    throw new Error('Unknown error fetching team members');
  }
}

export async function getTeamMemberById(id: string, preview = false): Promise<TeamMember | null> {
  try {
    const response = await fetchGraphQL<TeamMember>(
      `query GetTeamMemberById($id: String!, $preview: Boolean!) {
        teamMemberCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            ${TEAM_MEMBER_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { teamMemberCollection?: { items?: TeamMember[] } };

    // Return null if team member not found
    if (!data.teamMemberCollection?.items?.length) {
      return null;
    }

    return data.teamMemberCollection.items[0]!;
  } catch (error) {
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching team member by ID: ${error.message}`);
    }
    throw new Error('Unknown error fetching team member by ID');
  }
}
