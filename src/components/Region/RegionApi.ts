import { fetchGraphQL } from '@/lib/api';
import { ASSET_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import type { Region, RegionResponse, RegionsMap } from '@/components/Region/RegionSchema';

const REGION_GRAPHQL_FIELDS = `
  sys {
    id
  }
  __typename
  region
  slug
  street
  city
  country
  location {
    lat
    lon
  }
`;

export const REGIONS_MAP_GRAPHQL_FIELDS = `
  sys {
    id
  }
  __typename
  title
  overline
  regionsCollection(limit: 100) {
    items {
      ${REGION_GRAPHQL_FIELDS}
    }
  }
  mapImage {
    ${ASSET_FIELDS}
  }
`;

export async function getAllRegions(): Promise<RegionResponse | null> {
  try {
    const response = await fetchGraphQL<Region>(
      `query GetAllRegions {
        regionCollection(limit: 50) {
          items {
            ${REGION_GRAPHQL_FIELDS}
          }
        }
      }
    `
    );

    if (!response?.data) {
      return null;
    }

    const data = response.data as unknown as {
      regionCollection?: {
        items?: Region[];
      };
    };

    if (!data.regionCollection?.items?.length) {
      return null;
    }

    return {
      items: data.regionCollection.items
    };
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Services: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Services');
  }
}

// Add this to your existing region.ts file
export async function getRegionsMapById(id: string): Promise<RegionsMap | null> {
  try {
    const response = await fetchGraphQL<{ regionsMap: RegionsMap }>(
      `query GetRegionsMapById($id: String!) {
        regionsMap(id: $id) {
          ${REGIONS_MAP_GRAPHQL_FIELDS}
        }
      }`,
      { id }
    );

    if (!response?.data) {
      return null;
    }

    const data = response.data as unknown as {
      regionsMap?: RegionsMap;
    };

    if (!data.regionsMap) {
      return null;
    }

    return data.regionsMap;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Region Map: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Region Map');
  }
}
