import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { CONTENTGRIDITEM_GRAPHQL_FIELDS } from '@/components/ContentGrid/ContentGridApi';
import { NEWSLETTER_SIGNUP_GRAPHQL_FIELDS } from '@/components/Forms/NewsletterSignup/NewsletterSignupApi';
import { IMAGE_GRAPHQL_FIELDS } from '@/components/Image/ImageApi';
import { PRODUCT_GRAPHQL_FIELDS } from '@/components/Product/ProductApi';
import { SECTION_HEADING_GRAPHQL_FIELDS } from '@/components/SectionHeading/SectionHeadingApi';
import { VIDEO_GRAPHQL_FIELDS } from '@/components/Video/VideoApi';

import type { Content } from '@/components/Content/ContentSchema';

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
    ... on ContentGridItem {
      ${CONTENTGRIDITEM_GRAPHQL_FIELDS}
    }
    ... on NewsletterSignup {
      ${NEWSLETTER_SIGNUP_GRAPHQL_FIELDS}
    }
    ... on Product {
      ${PRODUCT_GRAPHQL_FIELDS}
    }
    ... on SectionHeading {
      ${SECTION_HEADING_GRAPHQL_FIELDS}
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
