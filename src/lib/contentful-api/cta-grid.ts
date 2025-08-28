import { fetchGraphQL } from '../api';

import type { CtaGrid } from '@/types/contentful';
import { SYS_FIELDS, INTERNAL_LINK_FIELDS } from './graphql-fields';
import { IMAGE_GRAPHQL_FIELDS } from './image';
import { CONTENTGRIDITEM_GRAPHQL_FIELDS } from './content-grid';

export const CTAGRID_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  asset {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  itemsCollection(limit: 20) {
    items {
      ... on ContentGridItem {
        ${CONTENTGRIDITEM_GRAPHQL_FIELDS}
      }
    }
  }
  ctaCollection(limit: 10) {
    items {
      ... on Button {
        sys { id }
        text
        internalText
        internalLink {
          ${INTERNAL_LINK_FIELDS}
        }
        externalLink
      }
    }
  }
  variant 
`;

export const getCtaGridById = async (
  id: string,
  preview = false
): Promise<{ item: CtaGrid | null }> => {
  console.log('🚀 getCtaGridById called with ID:', id);

  try {
    console.log('🚀 About to call fetchGraphQL (this was hanging before)');

    // First, let's see what the actual query looks like
    const query = `query GetCtaGridById($preview: Boolean!, $id: String!) {
      ctaGrid(id: $id, preview: $preview) {
        ${CTAGRID_GRAPHQL_FIELDS}
      }
    }`;

    const fetchPromise = fetchGraphQL<{ ctaGrid: CtaGrid }>(query, { id, preview }, preview);

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('fetchGraphQL timeout after 15 seconds - likely network or API issue'));
      }, 15000);
    });

    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (!response?.data) {
      console.log('❌ No response.data found');
      return { item: null };
    }

    const data = response.data as unknown as { ctaGrid: CtaGrid | null };

    return {
      item: data.ctaGrid ?? null
    };
  } catch (error) {
    console.error('❌ Error in getCtaGridById:', error);
    console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error');

    // Return null instead of throwing to prevent component crashes
    return { item: null };
  }
};
