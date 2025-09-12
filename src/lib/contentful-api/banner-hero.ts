import { fetchGraphQL } from '../api';
import type { BannerHero, BannerHeroResponse } from '@/types/contentful';
import { ContentfulError, NetworkError } from '../errors';
import { IMAGE_GRAPHQL_FIELDS } from './image';
import { SECTION_HEADING_GRAPHQL_FIELDS } from '../../components/SectionHeading/SectionHeadingApi';
import { SYS_FIELDS } from './graphql-fields';

// BannerHero fields
export const BANNERHERO_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  heading {
    ${SECTION_HEADING_GRAPHQL_FIELDS}
  }
  backgroundImage {
    ${IMAGE_GRAPHQL_FIELDS}
  }
`;

export const BANNERHEROES_PER_PAGE = 10;

/**
 * Fetches all banner heroes from Contentful
 * @param preview - Whether to fetch draft content
 * @param limit - Maximum number of banner heroes to fetch
 * @param skip - Number of banner heroes to skip for pagination
 * @returns Promise resolving to banner heroes response with pagination info
 */
export async function getAllBannerHeroes(
  preview = false,
  limit = BANNERHEROES_PER_PAGE,
  skip = 0
): Promise<BannerHeroResponse> {
  try {
    const response = await fetchGraphQL<BannerHero>(
      `query GetAllBannerHeroes($preview: Boolean!, $limit: Int!, $skip: Int!) {
        bannerHeroCollection(preview: $preview, limit: $limit, skip: $skip) {
          items {
            ${BANNERHERO_GRAPHQL_FIELDS}
          }
          total
        }
      }`,
      { preview, limit, skip },
      preview
    );

    if (!response.data?.bannerHeroCollection) {
      throw new ContentfulError('Failed to fetch banner heroes from Contentful');
    }

    return {
      items: response.data.bannerHeroCollection.items,
      total: response.data.bannerHeroCollection.total
    };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching banner heroes: ${error.message}`);
    }
    throw new Error('Unknown error fetching banner heroes');
  }
}

/**
 * Fetches a single banner hero by ID
 * @param id - The ID of the banner hero to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the banner hero or null if not found
 */
export async function getBannerHero(id: string, preview = true): Promise<BannerHero | null> {
  try {
    const response = await fetchGraphQL<BannerHero>(
      `query GetBannerHeroById($id: String!, $preview: Boolean!) {
        bannerHeroCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            ${BANNERHERO_GRAPHQL_FIELDS}
          }
        }
      }`,
      { id, preview },
      preview
    );

    if (!response.data?.bannerHeroCollection?.items?.length) {
      return null;
    }

    return response.data.bannerHeroCollection.items[0]!;
  } catch (error) {
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching banner hero: ${error.message}`);
    }
    throw new Error('Unknown error fetching banner hero');
  }
}
