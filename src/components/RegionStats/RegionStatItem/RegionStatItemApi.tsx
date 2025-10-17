import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import type { RegionStatItem } from '@/components/RegionStats/RegionStatItem/RegionStatItemSchema';

export const REGION_STAT_ITEM_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  heading
  subHeading
  description
  __typename
`;

export const getRegionStatItemById = async (
  id: string,
  preview: boolean
): Promise<RegionStatItem | null> => {
  try {
    const response = await fetchGraphQL<RegionStatItem>(
      `query GetRegionStatItemById($preview: Boolean!, $id: String!) {
        regionStatItem(id: $id, preview: $preview) {
          ${REGION_STAT_ITEM_GRAPHQL_FIELDS}
        }
      }`,
      { id, preview },
      preview
    );

    const data = response.data as unknown as {
      regionStatItem?: RegionStatItem;
    };

    if (!data?.regionStatItem) {
      throw new ContentfulError('Failed to fetch region stat item from Contentful');
    }

    return data.regionStatItem;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching region stat item: ${error.message}`);
    }
    throw new Error('Unknown error fetching region stat item');
  }
};
