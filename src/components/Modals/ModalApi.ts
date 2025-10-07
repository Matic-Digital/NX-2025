import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { HUBSPOTFORM_GRAPHQL_FIELDS } from '@/components/Forms/HubspotForm/HubspotFormApi';

import type { Modal } from '@/components/Modals/Modal';

// ============================================================================
// GRAPHQL FIELDS
// ============================================================================

export const MODAL_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  description
  form {
    ${HUBSPOTFORM_GRAPHQL_FIELDS}
  }
`;

export const MODAL_MINIMAL_FIELDS = `
  sys { id }
  title
  description
  __typename
`;

// ============================================================================
// CONTENTFUL API FUNCTIONS
// ============================================================================

export async function getModalById(id: string, preview = false): Promise<Modal | null> {
  const query = `
    query GetModalById($id: String!, $preview: Boolean!) {
      modal(id: $id, preview: $preview) {
        ${MODAL_GRAPHQL_FIELDS}
      }
    }
  `;

  try {
    const response = await fetchGraphQL(query, { id, preview });

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    const data = response.data as unknown as {
      modal?: Modal;
    };

    return data.modal ?? null;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`getModalByIdError: fetching Modal: ${error.message}`);
    }
    throw new Error('getModalById: Unknown error fetching Modal');
  }
}

export async function getModalsByIds(modalIds: string[], preview = false): Promise<Modal[]> {
  if (modalIds.length === 0) {
    return [];
  }

  const query = `
    query GetModalsByIds($ids: [String!]!, $preview: Boolean!) {
      modalCollection(where: { sys: { id_in: $ids } }, preview: $preview) {
        items {
          ${MODAL_GRAPHQL_FIELDS}
        }
      }
    }
  `;

  try {
    const response = await fetchGraphQL(query, {
      ids: modalIds,
      preview
    });

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    const data = response.data as unknown as {
      modalCollection?: { items?: Modal[] };
    };

    if (!data.modalCollection?.items?.length) {
      throw new ContentfulError('Failed to fetch Modals from Contentful');
    }

    return data.modalCollection.items;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`getModalsByIdsError: fetching Modals: ${error.message}`);
    }
    throw new Error('getModalsByIds: Unknown error fetching Modals');
  }
}
