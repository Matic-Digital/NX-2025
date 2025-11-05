import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { CONTENTGRIDITEM_GRAPHQL_FIELDS } from '@/components/ContentGrid/ContentGridApi';
import { HUBSPOTFORM_GRAPHQL_FIELDS } from '@/components/Forms/HubspotForm/HubspotFormApi';
import { IMAGE_GRAPHQL_FIELDS } from '@/components/Image/ImageApi';
import { PRODUCT_GRAPHQL_FIELDS } from '@/components/Product/ProductApi';
import { SECTION_HEADING_GRAPHQL_FIELDS } from '@/components/SectionHeading/SectionHeadingApi';
import { VIDEO_MINIMAL_FIELDS } from '@/components/Video/VideoApi';

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
      ${VIDEO_MINIMAL_FIELDS}
    }
  }
  item {
    ... on ContentGridItem {
      ${CONTENTGRIDITEM_GRAPHQL_FIELDS}
    }
    ... on HubspotForm {
      ${HUBSPOTFORM_GRAPHQL_FIELDS}
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
 * Fetches content by ID from Contentful with server-side enrichment
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
    let content = data.content;

    if (!content) {
      return { item: null };
    }

    // Server-side enrichment for nested components (same pattern as other APIs)
    if (content.item?.sys?.id && content.item.__typename) {
      
      try {
        switch (content.item.__typename) {
          case 'ContentGridItem': {
            const { getContentGridItemById } = await import('@/components/ContentGrid/ContentGridApi');
            const enrichedItem = await getContentGridItemById(content.item.sys.id, preview);
            if (enrichedItem) {
              content.item = enrichedItem as any;
            }
            break;
          }
          
          case 'HubspotForm': {
            const { getHubspotFormById } = await import('@/components/Forms/HubspotForm/HubspotFormApi');
            const enrichedItem = await getHubspotFormById(content.item.sys.id, preview);
            if (enrichedItem) {
              content.item = enrichedItem as any;
            }
            break;
          }
          
          case 'Product': {
            const { getProductById } = await import('@/components/Product/ProductApi');
            const enrichedItem = await getProductById(content.item.sys.id, preview);
            if (enrichedItem) {
              content.item = enrichedItem as any;
            }
            break;
          }
          
          case 'SectionHeading': {
            const { getSectionHeadingById } = await import('@/components/SectionHeading/SectionHeadingApi');
            const enrichedItem = await getSectionHeadingById(content.item.sys.id, preview);
            if (enrichedItem) {
              content.item = enrichedItem as any;
            }
            break;
          }
          
          default:
            break;
        }
      } catch (error) {
        console.warn(`Content API: Failed to enrich ${content.item.__typename} item ${content.item.sys.id}:`, error);
        // Continue with original item on error
      }
    }

    // Server-side enrichment for asset if it's a complex type
    if (content.asset?.sys?.id && content.asset.__typename) {
      
      try {
        switch (content.asset.__typename) {
          case 'Video': {
            const { getVideoById } = await import('@/components/Video/VideoApi');
            const enrichedAsset = await getVideoById(content.asset.sys.id, preview);
            if (enrichedAsset) {
              content.asset = enrichedAsset as any;
            }
            break;
          }
          
          default:
            break;
        }
      } catch (error) {
        console.warn(`Content API: Failed to enrich ${content.asset?.__typename} asset ${content.asset?.sys.id}:`, error);
        // Continue with original asset on error
      }
    }


    return {
      item: content
    };
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching content by ID: ${_error.message}`);
    }
    throw new NetworkError('Unknown error fetching content');
  }
};
