import { fetchGraphQL } from '../../lib/api';
import { SYS_FIELDS } from '../../lib/contentful-api/graphql-fields';
import type { HubspotForm } from '@/components/HubspotForm/HubspotFormSchema';
import { ContentfulError, NetworkError } from '../../lib/errors';

// Define minimal hubspot form fields for references
export const HUBSPOTFORM_MINIMAL_FIELDS = `
  sys { id }
  title
  formLink
  __typename
`;

// Define full hubspot form fields
export const HUBSPOTFORM_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  formLink
`;

/**
 * Fetches hubspot form by ID from Contentful
 * @param id - The ID of the hubspot form to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the hubspot form or null if not found
 */
export const getHubspotFormById = async (
  id: string,
  preview = false
): Promise<{ item: HubspotForm | null }> => {
  try {
    const response = await fetchGraphQL<{ hubspotForm: HubspotForm }>(
      `
      query GetHubspotFormById($preview: Boolean!, $id: String!) {
        hubspotForm(id: $id, preview: $preview) {
          ${HUBSPOTFORM_GRAPHQL_FIELDS}
        }
      }
    `,
      { id, preview },
      preview
    );

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    const data = response.data as { hubspotForm: HubspotForm | null };

    return {
      item: data.hubspotForm ?? null
    };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching hubspot form by ID: ${error.message}`);
    }
    throw new NetworkError('Unknown error fetching hubspot form');
  }
};
