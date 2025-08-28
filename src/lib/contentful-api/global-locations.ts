// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
//

import { fetchGraphQL } from '../api';
import {
  GlobalLocationSchema,
  GlobalLocationsCollectionSchema
} from '@/types/contentful/GlobalLocation';
import type { GlobalLocation, GlobalLocationsCollection } from '@/types/contentful/GlobalLocation';

const GLOBAL_LOCATION_GRAPHQL_FIELDS = `
  sys {
    id
  }
  __typename
  title
  region
  address
  slug
  coordinates {
    lat
    lng
  }
`;

export const getAllGlobalLocations = async (): Promise<GlobalLocationsCollection | null> => {
  const query = `
    query GetAllGlobalLocations {
      globalLocationCollection(limit: 50) {
        total
        items {
          ${GLOBAL_LOCATION_GRAPHQL_FIELDS}
        }
      }
    }
  `;

  try {
    const response = await fetchGraphQL({ query });

    if (!response?.data?.globalLocationCollection) {
      return null;
    }

    const result = GlobalLocationsCollectionSchema.parse(response.data.globalLocationCollection);
    return result;
  } catch (error) {
    console.error('Error fetching global locations:', error);
    return null;
  }
};

export const getGlobalLocationBySlug = async (slug: string): Promise<GlobalLocation | null> => {
  const query = `
    query GetGlobalLocationBySlug($slug: String!) {
      globalLocationCollection(where: { slug: $slug }, limit: 1) {
        items {
          ${GLOBAL_LOCATION_GRAPHQL_FIELDS}
        }
      }
    }
  `;

  try {
    const response = await fetchGraphQL({
      query,
      variables: { slug }
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!response?.data?.globalLocationCollection?.items?.[0]) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const result = GlobalLocationSchema.parse(response.data.globalLocationCollection.items[0]);
    return result;
  } catch (error) {
    console.error('Error fetching global location by slug:', error);
    return null;
  }
};

export const getGlobalLocationsByRegion = async (region: string): Promise<GlobalLocation[]> => {
  const query = `
    query GetGlobalLocationsByRegion($region: String!) {
      globalLocationCollection(where: { region: $region }, limit: 20) {
        items {
          ${GLOBAL_LOCATION_GRAPHQL_FIELDS}
        }
      }
    }
  `;

  try {
    const response = await fetchGraphQL({
      query,
      variables: { region }
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!response?.data?.globalLocationCollection?.items) {
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const items = response.data.globalLocationCollection.items.map((item: unknown) =>
      GlobalLocationSchema.parse(item)
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return items;
  } catch (error) {
    console.error('Error fetching global locations by region:', error);
    return [];
  }
};
