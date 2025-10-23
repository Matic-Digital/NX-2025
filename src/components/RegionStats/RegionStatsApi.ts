import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { BUTTON_GRAPHQL_FIELDS } from '@/components/Button/ButtonApi';
import { REGION_STAT_ITEM_GRAPHQL_FIELDS } from '@/components/RegionStats/RegionStatItem/RegionStatItemApi';

import type { RegionStats } from '@/components/RegionStats/RegionStatsSchema';

export const REGIONSTATS_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  image {
    ${SYS_FIELDS}
    description
    url
    width
    height
  }
  itemsCollection {
    items {
      ${REGION_STAT_ITEM_GRAPHQL_FIELDS}
    }
  }
  cta {
    ${BUTTON_GRAPHQL_FIELDS}
  }
  __typename
`;

export const getRegionStatsById = async (
  id: string,
  preview: boolean
): Promise<RegionStats | null> => {
  try {
    const response = await fetchGraphQL<RegionStats>(
      `query GetRegionStatsById($preview: Boolean!, $id: String!) {
        regionStats(id: $id, preview: $preview) {
          ${REGIONSTATS_GRAPHQL_FIELDS}
        }
      }`,
      { id, preview },
      preview
    );

    const data = response.data as unknown as {
      regionStats?: RegionStats;
    };

    if (!data?.regionStats) {
      throw new ContentfulError('Failed to fetch region stats from Contentful');
    }

    return data.regionStats;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching region stats: ${_error.message}`);
    }
    throw new Error('Unknown error fetching region stats');
  }
};
