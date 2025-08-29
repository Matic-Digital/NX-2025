import { fetchGraphQL } from '../api';
import { ContentfulError, NetworkError } from '../errors';
import type { Region, RegionResponse, RegionsMap } from '@/types/contentful/Region';
import { ASSET_FIELDS } from './graphql-fields';

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
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Services: ${error.message}`);
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
      console.error('No data in response for regionsMap with id:', id);
      return null;
    }

    const data = response.data as unknown as {
      regionsMap?: RegionsMap;
    };

    if (!data.regionsMap) {
      return null;
    }

    return data.regionsMap;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Region Map: ${error.message}`);
    }
    throw new Error('Unknown error fetching Region Map');
  }
}
