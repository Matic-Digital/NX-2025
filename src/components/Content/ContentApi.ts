import { fetchGraphQL } from '../../lib/api';
import { SYS_FIELDS } from '../../lib/contentful-api/graphql-fields';
import { PRODUCT_GRAPHQL_FIELDS } from '../../lib/contentful-api/product';
import type { Content } from '@/components/Content/ContentSchema';
import { ContentfulError, NetworkError } from '../../lib/errors';
import { IMAGE_GRAPHQL_FIELDS } from '../Image/ImageApi';
import { VIDEO_GRAPHQL_FIELDS } from '../Video/VideoApi';
import { CONTENTGRIDITEM_GRAPHQL_FIELDS } from '../ContentGrid/ContentGridApi';

// Define minimal content fields for references
export const CONTENT_MINIMAL_FIELDS = `
  sys { id }
  title
  __typename
`;

// Define full content fields
export const CONTENT_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  variant
  asset {
    ... on Image {
      ${IMAGE_GRAPHQL_FIELDS}
    }
    ... on Video {
      ${VIDEO_GRAPHQL_FIELDS}
    }
  }
  item {
    ... on Product {
      ${PRODUCT_GRAPHQL_FIELDS}
    }
    ... on SectionHeading {
      ${SYS_FIELDS}
    }
    ... on ContentGridItem {
      ${CONTENTGRIDITEM_GRAPHQL_FIELDS}
    }
  }
`;

/**
 * Fetches content by ID from Contentful
 * @param id - The ID of the content to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the content or null if not found
 */
export const getContentById = async (
  id: string,
  preview = false
): Promise<{ item: Content | null }> => {
  try {
    const response = await fetchGraphQL<{ content: Content }>(
      `
      query GetContentById($preview: Boolean!, $id: String!) {
        content(id: $id, preview: $preview) {
          ${CONTENT_GRAPHQL_FIELDS}
        }
      }
    `,
      { id, preview },
      preview
    );

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    const data = response.data as { content: Content | null };

    return {
      item: data.content ?? null
    };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching content by ID: ${error.message}`);
    }
    throw new NetworkError('Unknown error fetching content');
  }
};
