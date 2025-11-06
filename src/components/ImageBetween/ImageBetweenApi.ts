import { fetchGraphQL } from '@/lib/api';
import { getCacheConfig } from '@/lib/cache-tags';
import { ASSET_FIELDS, SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { getBannerHero } from '@/components/BannerHero/BannerHeroApi';
import { getContentGridById } from '@/components/ContentGrid/ContentGridApi';
import { IMAGE_GRAPHQL_FIELDS } from '@/components/Image/ImageApi';
import { getSliderById, SLIDER_MINIMAL_FIELDS } from '@/components/Slider/SliderApi';
import { VIDEO_MINIMAL_FIELDS } from '@/components/Video/VideoApi';

import type { ImageBetween } from '@/components/ImageBetween/ImageBetweenSchema';

// ImageBetween fields
export const IMAGEBETWEEN_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  contentTop {
    ... on ContentGrid {
      ${SYS_FIELDS}
    }
    ... on BannerHero {
      ${SYS_FIELDS}
    }
  }
  asset {
    __typename
    ... on Image {
      ${IMAGE_GRAPHQL_FIELDS}
    }
    ... on Video {
      ${VIDEO_MINIMAL_FIELDS}
    }
    ... on Slider {
      ${SLIDER_MINIMAL_FIELDS}
    }
    ... on ContentGrid {
      ${SYS_FIELDS}
    }
  }
  backgroundMedia {
    ${ASSET_FIELDS}
  }
  contentBottom {
    ${SYS_FIELDS}
  }
`;

/**
 * Fetches ImageBetween with enriched nested data
 * First fetches minimal structure, then enriches with full nested content
 */
export async function getImageBetweenById(
  id: string,
  preview = false
): Promise<ImageBetween | null> {
  try {
    const cacheConfig = getCacheConfig('ImageBetween', { id });
    // Step 1: Fetch minimal ImageBetween structure
    const response = await fetchGraphQL(
      `query GetImageBetweenById($id: String!, $preview: Boolean!) {
        imageBetweenCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            ${IMAGEBETWEEN_GRAPHQL_FIELDS}
          }
        }
      }`,
      { id, preview },
      preview,
      cacheConfig
    );

    const data = response.data as any;
    if (!data?.imageBetweenCollection?.items?.length) {
      return null;
    }

    const imageBetween = data.imageBetweenCollection.items[0] as ImageBetween;

    // Step 2: Enrich with nested data in parallel
    const enrichmentPromises = [];

    // Enrich contentTop
    if (imageBetween.contentTop?.sys?.id) {
      if (imageBetween.contentTop.__typename === 'ContentGrid') {
        console.warn(`ImageBetween: Enriching ContentGrid contentTop ${imageBetween.contentTop.sys.id}`);
        enrichmentPromises.push(
          getContentGridById(imageBetween.contentTop.sys.id, preview)
            .then(data => {
              console.warn(`ImageBetween: ContentGrid contentTop enriched successfully:`, {
                id: imageBetween.contentTop.sys.id,
                hasData: !!data,
                hasItems: !!data?.itemsCollection?.items?.length,
                itemCount: data?.itemsCollection?.items?.length || 0
              });
              return { type: 'contentTop', data };
            })
        );
      } else if (imageBetween.contentTop.__typename === 'BannerHero') {
        enrichmentPromises.push(
          getBannerHero(imageBetween.contentTop.sys.id, preview)
            .then(data => ({ type: 'contentTop', data }))
        );
      }
    }

    // Enrich asset if it's a complex type
    if (imageBetween.asset?.sys?.id) {
      if (imageBetween.asset.__typename === 'Slider') {
        // Try to enrich Slider but handle GraphQL schema errors gracefully
        enrichmentPromises.push(
          getSliderById(imageBetween.asset.sys.id, preview)
            .then(data => ({ type: 'asset', data }))
            .catch(error => {
              console.warn('Skipping Slider enrichment due to GraphQL schema mismatch:', error.message);
              return { type: 'asset', data: null };
            })
        );
      } else if (imageBetween.asset.__typename === 'ContentGrid') {
        console.warn(`ImageBetween: Enriching ContentGrid asset ${imageBetween.asset.sys.id}`);
        enrichmentPromises.push(
          getContentGridById(imageBetween.asset.sys.id, preview)
            .then(data => {
              console.warn(`ImageBetween: ContentGrid asset enriched successfully:`, {
                id: imageBetween.asset?.sys?.id,
                hasData: !!data,
                hasItems: !!data?.itemsCollection?.items?.length,
                itemCount: data?.itemsCollection?.items?.length || 0
              });
              return { type: 'asset', data };
            })
            .catch(error => {
              console.warn(`Failed to enrich ContentGrid asset ${imageBetween.asset?.sys?.id} in ImageBetween:`, error);
              return { type: 'asset', data: null };
            })
        );
      }
    }

    // Enrich contentBottom
    if (imageBetween.contentBottom?.sys?.id) {
      enrichmentPromises.push(
        getContentGridById(imageBetween.contentBottom.sys.id, preview)
          .then(data => ({ type: 'contentBottom', data }))
      );
    }

    // Step 3: Wait for all enrichments and merge
    const enrichments = await Promise.all(enrichmentPromises);
    
    // Apply enrichments to the ImageBetween object
    for (const enrichment of enrichments) {
      if (enrichment.data) {
        if (enrichment.type === 'contentTop') {
          imageBetween.contentTop = enrichment.data as any;
        } else if (enrichment.type === 'asset') {
          imageBetween.asset = enrichment.data as any;
        } else if (enrichment.type === 'contentBottom') {
          imageBetween.contentBottom = enrichment.data as any;
        }
      }
    }

    return imageBetween;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching ImageBetween by ID: ${_error.message}`);
    }
    throw new Error('Unknown error fetching ImageBetween by ID');
  }
}
