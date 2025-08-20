import { fetchGraphQL } from '../api';
import type { FeatureSliderItem } from '@/types/contentful/FeatureSliderItem';
import { ContentfulError, NetworkError } from '../errors';
import { SYS_FIELDS, ASSET_FIELDS } from './graphql-fields';

// Simplified Product fields for individual Product queries (to stay within Contentful query size limit)
export const FEATURE_SLIDERITEM_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  description
  icon {
    ${ASSET_FIELDS}
  }
`;

export async function getFeatureSliderItemById(
  id: string,
  preview = false
): Promise<FeatureSliderItem | null> {
  try {
    const response = await fetchGraphQL<FeatureSliderItem>(
      `query GetFeatureSliderItemById($id: String!, $preview: Boolean!) {
        featureSliderItem(id: $id, preview: $preview) {
          ${FEATURE_SLIDERITEM_GRAPHQL_FIELDS}
        }   
      }`,
      { id, preview },
      preview
    );

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    const data = response.data as unknown as { featureSliderItem?: FeatureSliderItem };

    if (!data.featureSliderItem) {
      return null;
    }

    return data.featureSliderItem;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching FeatureSliderItem: ${error.message}`);
    }
    throw new Error('Unknown error fetching FeatureSliderItem');
  }
}
