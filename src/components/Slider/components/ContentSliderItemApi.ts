import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { IMAGE_GRAPHQL_FIELDS } from '@/components/Image/ImageApi';

import type { ContentSliderItem } from '@/components/Slider/components/ContentSliderItemSchema';

export const CONTENTSLIDERITEM_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  image {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  title
  description
`;

/**
 * Fetches a single ContentSliderItem by ID
 * @param id - The ID of the ContentSliderItem to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the ContentSliderItem or null if not found
 */
export async function getContentSliderItemById(
  id: string,
  preview = false
): Promise<ContentSliderItem | null> {
  try {
    const response = await fetchGraphQL(
      `query GetContentSliderItemById($id: String!, $preview: Boolean!) {
        contentSliderItem(id: $id, preview: $preview) {
          ${CONTENTSLIDERITEM_GRAPHQL_FIELDS}
        }
      }`,
      { id, preview },
      preview
    );

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    const data = response.data as unknown as { contentSliderItem?: ContentSliderItem };

    return data.contentSliderItem || null;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching ContentSliderItem: ${_error.message}`);
    }
    throw new Error('Unknown error fetching ContentSliderItem');
  }
}
