import { fetchGraphQL } from '@/lib/api';
import {
  ASSET_FIELDS,
  INTERNAL_LINK_FIELDS,
  SYS_FIELDS
} from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { IMAGE_GRAPHQL_FIELDS } from '@/components/Image/ImageApi';
import { SLIDER_MINIMAL_FIELDS, getSliderById } from '@/components/Slider/SliderApi';

import type { ContentGridItem } from '@/components/ContentGrid/ContentGridItemSchema';
import type { ContentGrid, ContentGridResponse } from '@/components/ContentGrid/ContentGridSchema';

// ContentGridItem fields - minimal for initial load (no link field)
export const CONTENTGRIDITEM_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  heading
  subheading
  tags
  ctaCollection(limit: 2) {
      items {
        sys { id }
        internalText
        text
        internalLink {
          ${INTERNAL_LINK_FIELDS}
        }
        externalLink
        modal {
          sys { id }
          title
          description
        }
        icon
      }
    }
  description
  icon {
    ${ASSET_FIELDS}
  }
  image {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  variant
`;

// ContentGrid fields
export const CONTENTGRID_GRAPHQL_FIELDS = `
  ${SYS_FIELDS} 
  heading {
    ${SYS_FIELDS}
  }
  backgroundImage {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  backgroundAsset {
    ${ASSET_FIELDS}
  }
  itemsCollection(limit: 20) {
    items {
      ... on Accordion {
        ${SYS_FIELDS}
      }
      ... on ContactCard {
        ${SYS_FIELDS}
      }
      ... on ContentGridItem {
        ${SYS_FIELDS}
        variant
        image {
          sys {
            id
          }
        }
      }
      ... on CtaGrid {
        ${SYS_FIELDS}
      }
      ... on Image {
        ${SYS_FIELDS}
      }
      ... on OfficeLocation {
        ${SYS_FIELDS}
      }
      ... on Post {
        ${SYS_FIELDS}
      }
      ... on Product {
        ${SYS_FIELDS}
      }
      ... on Service {
        ${SYS_FIELDS}
      }
      ... on Slider {
        ${SLIDER_MINIMAL_FIELDS}
      }
      ... on Solution {
        ${SYS_FIELDS}
        title
        slug
        heading
        subheading
        cardTitle
        description
        backgroundImage {
          ${IMAGE_GRAPHQL_FIELDS}
        }
        variant
      }
      ... on Testimonials {
        ${SYS_FIELDS}
      }
      ... on Video {
        ${SYS_FIELDS}
      }
      ... on Event {
        ${SYS_FIELDS}
      }
    }
  }
  title
  theme
  variant
`;

/**
 * Fetches a single ContentGrid by ID from Contentful
 * @param id - The ID of the ContentGrid to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to ContentGrid or null if not found
 */
export async function getContentGridById(id: string, preview = false): Promise<ContentGrid | null> {
  try {
    const response = await fetchGraphQL(
      `query GetContentGridById($id: String!, $preview: Boolean!) {
        contentGrid(id: $id, preview: $preview) {
          ${CONTENTGRID_GRAPHQL_FIELDS}
        }
      }`,
      { id, preview },
      preview
    );

    // Check for valid response
    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to help TypeScript understand the structure
    const data = response.data as unknown as { contentGrid?: ContentGrid };

    // Return null if content grid not found
    if (!data.contentGrid) {
      return null;
    }

    const contentGrid = data.contentGrid;

    // Step 2: Enrich Slider, Post, and Collection items in ContentGrid (PARALLEL server-side lazy loading)
    if (contentGrid.itemsCollection?.items?.length && contentGrid.itemsCollection.items.length > 0) {
      console.log('ContentGrid: Starting PARALLEL enrichment for', contentGrid.itemsCollection.items.length, 'items');
      
      // First, check for empty objects (Collections) and get their IDs (PARALLEL with other processing)
      const hasEmptyObjects = contentGrid.itemsCollection.items.some(
        (item: any) => item && typeof item === 'object' && Object.keys(item).length === 0
      );
      
      // Start Collection ID fetching in parallel (don't await yet)
      const collectionIdsPromise = hasEmptyObjects 
        ? getCollectionIdsFromContentGrid(id).then(ids => {
            console.log('ContentGrid: Found Collection IDs (PARALLEL):', ids);
            return ids;
          }).catch(error => {
            console.warn('Failed to get Collection IDs for ContentGrid:', error);
            return [];
          })
        : Promise.resolve([]);
      
      // Process all items in parallel, awaiting Collection IDs only when needed
      const enrichmentPromises = contentGrid.itemsCollection.items.map(async (item: any, index: number) => {
        // Handle empty objects (Collections) - await Collection IDs when needed
        if (item && typeof item === 'object' && Object.keys(item).length === 0) {
          try {
            const collectionIds = await collectionIdsPromise;
            // Find the index of this empty object to get the correct Collection ID
            const items = contentGrid.itemsCollection?.items || [];
            const emptyObjectsUpToIndex = items
              .slice(0, index + 1)
              .filter(i => i && typeof i === 'object' && Object.keys(i).length === 0);
            const emptyObjectIndex = Math.max(0, emptyObjectsUpToIndex.length - 1);
            
            const collectionId = collectionIds[emptyObjectIndex];
            if (collectionId) {
              try {
                const { getCollectionById } = await import('@/components/Collection/CollectionApi');
                console.log('ContentGrid: Enriching Collection (empty object) PARALLEL', collectionId);
                const enrichedCollection = await getCollectionById(collectionId, preview);
                console.log('ContentGrid: Collection enrichment result (PARALLEL):', {
                  id: collectionId,
                  hasEnrichedData: !!enrichedCollection,
                  hasTitle: !!enrichedCollection?.title
                });
                return enrichedCollection || { sys: { id: collectionId }, __typename: 'Collection' };
              } catch (error) {
                console.warn(`Failed to enrich Collection ${collectionId} in ContentGrid:`, error);
                return { sys: { id: collectionId }, __typename: 'Collection' };
              }
            } else {
              console.warn('No Collection ID found for empty object at index', index);
              return { sys: { id: 'unknown-collection' }, __typename: 'Collection', title: 'Collection (No ID Found)' };
            }
          } catch (error) {
            console.warn('Failed to get Collection IDs for empty object:', error);
            return { sys: { id: 'error-collection' }, __typename: 'Collection', title: 'Collection (Error)' };
          }
        }
        if (item.__typename === 'Slider' && item.sys?.id) {
          try {
            // Enrich Slider with full item data
            const enrichedSlider = await getSliderById(item.sys.id, preview);
            return enrichedSlider || item;
          } catch (error) {
            console.warn(`Failed to enrich Slider ${item.sys.id} in ContentGrid:`, error);
            return item; // Return original item on error
          }
        } else if (item.__typename === 'Post' && item.sys?.id) {
          console.log('ContentGrid: Found Post to enrich:', item.sys.id, item);
          try {
            // Dynamically import Post API to avoid circular dependency
            const { getPostById } = await import('@/components/Post/PostApi');
            console.log('ContentGrid: Calling getPostById for', item.sys.id);
            const enrichedPost = await getPostById(item.sys.id, preview);
            console.log('ContentGrid: Post enrichment result:', {
              id: item.sys.id,
              hasEnrichedData: !!enrichedPost,
              hasTitle: !!enrichedPost?.title,
              hasSlug: !!enrichedPost?.slug,
              enrichedPost: enrichedPost
            });
            if (enrichedPost) {
              console.log('ContentGrid: Returning enriched Post');
              return enrichedPost;
            } else {
              console.warn('ContentGrid: getPostById returned null, returning original item');
              return item;
            }
          } catch (error) {
            console.error(`Failed to enrich Post ${item.sys.id} in ContentGrid:`, error);
            return item; // Return original item on error
          }
        }
        return item; // Return non-Slider items as-is
      });

      // Wait for all enrichments to complete
      const enrichedItems = await Promise.all(enrichmentPromises);
      if (contentGrid.itemsCollection) {
        contentGrid.itemsCollection.items = enrichedItems;
      }
    }

    return contentGrid;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching ContentGrid: ${_error.message}`);
    }
    throw new Error('Unknown error fetching ContentGrid');
  }
}

/**
 * Fetches all ContentGrids from Contentful
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to ContentGrids response with pagination info
 */
export async function getAllContentGrids(preview = false): Promise<ContentGridResponse> {
  try {
    const response = await fetchGraphQL<ContentGrid>(
      `query GetAllContentGrids($preview: Boolean!) {
        contentGridCollection(preview: $preview) {
          items {
            ${CONTENTGRID_GRAPHQL_FIELDS}
          }
        }
      }`,
      { preview },
      preview
    );

    // Check for valid response
    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to help TypeScript understand the structure
    const data = response.data as unknown as {
      contentGridCollection?: { items?: ContentGrid[] };
    };

    // Validate the data structure
    if (!data.contentGridCollection?.items?.length) {
      throw new ContentfulError('Failed to fetch ContentGrids from Contentful');
    }

    const contentGrids = data.contentGridCollection.items;

    // Step 2: Enrich Slider items in all ContentGrids (server-side lazy loading)
    const enrichedContentGrids = await Promise.all(
      contentGrids.map(async (contentGrid: any) => {
        if (contentGrid.itemsCollection?.items?.length && contentGrid.itemsCollection.items.length > 0) {
          const enrichmentPromises = contentGrid.itemsCollection.items.map(async (item: any) => {
            if (item.__typename === 'Slider' && item.sys?.id) {
              try {
                // Enrich Slider with full item data
                const enrichedSlider = await getSliderById(item.sys.id, preview);
                return enrichedSlider || item;
              } catch (error) {
                console.warn(`Failed to enrich Slider ${item.sys.id} in ContentGrid collection:`, error);
                return item; // Return original item on error
              }
            } else if (item.__typename === 'Post' && item.sys?.id) {
              try {
                // Dynamically import Post API to avoid circular dependency
                const { getPostById } = await import('@/components/Post/PostApi');
                const enrichedPost = await getPostById(item.sys.id, preview);
                return enrichedPost || item;
              } catch (error) {
                console.warn(`Failed to enrich Post ${item.sys.id} in ContentGrid collection:`, error);
                return item; // Return original item on error
              }
            }
            return item; // Return non-Slider items as-is
          });

          // Wait for all enrichments to complete
          const enrichedItems = await Promise.all(enrichmentPromises);
          if (contentGrid.itemsCollection) {
            contentGrid.itemsCollection.items = enrichedItems;
          }
        }
        return contentGrid;
      })
    );

    return {
      items: enrichedContentGrids
    };
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching ContentGrids: ${_error.message}`);
    }
    throw new Error('Unknown error fetching ContentGrids');
  }
}

/**
 * Fetches Collection IDs from a ContentGrid by checking for empty objects
 * @param contentGridId - The ID of the ContentGrid
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to array of Collection IDs
 */
export async function getCollectionIdsFromContentGrid(
  contentGridId: string,
  preview = false
): Promise<string[]> {
  try {
    const response = await fetchGraphQL(
      `query GetContentGridCollectionIds($id: String!, $preview: Boolean!) {
        contentGrid(id: $id, preview: $preview) {
          itemsCollection {
            items {
              ... on Collection {
                sys {
                  id
                }
              }
            }
          }
        }
      }`,
      { id: contentGridId, preview },
      preview
    );

    const data = response?.data as {
      contentGrid?: {
        itemsCollection?: {
          items?: Array<{ sys?: { id?: string } } | null>;
        };
      };
    };

    if (!data?.contentGrid?.itemsCollection?.items) {
      return [];
    }

    const collectionIds: string[] = [];
    for (const item of data.contentGrid.itemsCollection.items) {
      if (item?.sys?.id) {
        collectionIds.push(item.sys.id);
      }
    }

    return collectionIds;
  } catch {
    return [];
  }
}

export async function getContentGridItemById(
  id: string,
  preview = false
): Promise<ContentGridItem | null> {
  try {
    const response = await fetchGraphQL<ContentGridItem>(
      `query GetContentGridItemById($id: String!, $preview: Boolean!) {
        contentGridItem(id: $id, preview: $preview) {
          ${CONTENTGRIDITEM_GRAPHQL_FIELDS}
        }
      }`,
      { id, preview },
      preview
    );

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    const data = response.data as unknown as { contentGridItem?: ContentGridItem };

    if (!data.contentGridItem) {
      return null;
    }

    return data.contentGridItem;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching ContentGridItem: ${_error.message}`);
    }
    throw new Error('Unknown error fetching ContentGridItem');
  }
}

/**
 * Fetches link details for a ContentGridItem by its sys.id
 * @param entryId - The sys.id of the ContentGridItem
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to link details (slug and __typename)
 */
export async function getContentGridItemLink(
  entryId: string,
  preview = false
): Promise<{ link: { slug: string; __typename: string } } | null> {
  try {
    const response = await fetchGraphQL(
      `query GetContentGridItemLink($id: String!, $preview: Boolean!) {
        contentGridItem(id: $id, preview: $preview) {
          link {
            __typename
            ... on Page {
              slug
            }
            ... on PageList {
              slug
            }
            ... on Product {
              slug
            }
            ... on Service {
              slug
            }
            ... on Solution {
              slug
            }
            ... on Post {
              slug
            }
          }
        }
      }`,
      { id: entryId, preview },
      preview
    );

    const data = response?.data as {
      contentGridItem?: { link?: { slug?: string; __typename?: string } };
    };
    const linkData = data?.contentGridItem?.link;

    if (linkData?.slug) {
      return {
        link: {
          slug: linkData.slug,
          __typename: linkData.__typename ?? 'Unknown'
        }
      };
    }

    return null;
  } catch {
    // Silently handle GraphQL errors to prevent console spam
    return null;
  }
}
