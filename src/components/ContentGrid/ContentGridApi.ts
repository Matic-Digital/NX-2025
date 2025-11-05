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
          form {
            sys { id }
            title
            description
            formId
          }
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
    console.warn('ContentGrid: Checking itemsCollection for ContentGrid:', {
      id: contentGrid.sys?.id,
      title: contentGrid.title,
      hasItemsCollection: !!contentGrid.itemsCollection,
      itemsLength: contentGrid.itemsCollection?.items?.length || 0
    });
    
    // Special logging for Timeline Slider and Team Slider ContentGrids
    if (contentGrid.title === 'Timeline Slider' || contentGrid.title === 'Team Slider') {
      console.warn('ContentGrid: *** FOUND PROBLEMATIC CONTENTGRID ***', {
        id: contentGrid.sys?.id,
        title: contentGrid.title,
        isTimelineSlider: contentGrid.title === 'Timeline Slider',
        isTeamSlider: contentGrid.title === 'Team Slider',
        itemsCollection: contentGrid.itemsCollection,
        rawItems: contentGrid.itemsCollection?.items
      });
    }
    
    if (contentGrid.itemsCollection?.items?.length && contentGrid.itemsCollection.items.length > 0) {
      console.warn('ContentGrid: Starting PARALLEL enrichment for', contentGrid.itemsCollection.items.length, 'items');
      console.warn('ContentGrid items:', contentGrid.itemsCollection.items.map(item => ({
        id: item.sys?.id,
        typename: item.__typename,
        title: item.title || 'No title'
      })));
      console.warn('ContentGrid RAW items (full data):', contentGrid.itemsCollection.items);
      
      // Debug: Log the full ContentGrid structure to see if Sliders are elsewhere
      console.warn('ContentGrid FULL STRUCTURE:', {
        id: contentGrid.sys?.id,
        title: contentGrid.title,
        itemsCollectionLength: contentGrid.itemsCollection?.items?.length,
        fullContentGrid: contentGrid
      });
      
      // Debug: Check specifically for Slider items
      console.warn('ContentGrid: Checking for Slider items. All item types:', contentGrid.itemsCollection.items.map(item => item.__typename));
      const sliderItems = contentGrid.itemsCollection.items.filter(item => item.__typename === 'Slider');
      if (sliderItems.length > 0) {
        console.warn('ContentGrid: Found Slider items:', sliderItems.map(item => ({
          id: item.sys?.id,
          typename: item.__typename,
          hasTitle: !!(item as any).title,
          hasItemsCollection: !!(item as any).itemsCollection
        })));
      } else {
        console.warn('ContentGrid: No Slider items found in this ContentGrid');
        console.warn('ContentGrid: Available item types are:', [...new Set(contentGrid.itemsCollection.items.map(item => item.__typename))]);
      }
      
      // First, check for empty objects (Collections) and get their IDs (PARALLEL with other processing)
      const hasEmptyObjects = contentGrid.itemsCollection.items.some(
        (item: any) => item && typeof item === 'object' && Object.keys(item).length === 0
      );
      
      // Start Collection ID fetching in parallel (don't await yet)
      const collectionIdsPromise = hasEmptyObjects 
        ? getCollectionIdsFromContentGrid(id).then(ids => {
            console.warn('ContentGrid: Found Collection IDs (PARALLEL):', ids);
            return ids;
          }).catch(error => {
            console.warn('Failed to get Collection IDs for ContentGrid:', error);
            return [];
          })
        : Promise.resolve([]);
      
      // Process all items in parallel, awaiting Collection IDs only when needed
      const enrichmentPromises = contentGrid.itemsCollection.items.map(async (item: any, index: number) => {
        console.warn(`ContentGrid: Processing item ${index}:`, { id: item.sys?.id, typename: item.__typename, keys: Object.keys(item) });
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
            
            const collectionId = collectionIds.at(emptyObjectIndex);
            if (collectionId) {
              try {
                const { getCollectionById } = await import('@/components/Collection/CollectionApi');
                console.warn('ContentGrid: Enriching Collection (empty object) PARALLEL', collectionId);
                const enrichedCollection = await getCollectionById(collectionId, preview);
                console.warn('ContentGrid: Collection enrichment result (PARALLEL):', {
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
          console.warn('ContentGrid: Found Slider to enrich:', item.sys.id, {
            hasTitle: !!item.title,
            hasItemsCollection: !!item.itemsCollection,
            itemsCount: item.itemsCollection?.items?.length || 0,
            originalKeysCount: Object.keys(item).length
          });
          try {
            // Enrich Slider with full item data
            console.warn('ContentGrid: Calling getSliderById for', item.sys.id);
            const enrichedSlider = await getSliderById(item.sys.id, preview);
            console.warn('ContentGrid: Slider enrichment result:', {
              id: item.sys.id,
              hasEnrichedData: !!enrichedSlider,
              hasTitle: !!enrichedSlider?.title,
              hasItemsCollection: !!enrichedSlider?.itemsCollection,
              itemsCount: enrichedSlider?.itemsCollection?.items?.length || 0,
              enrichedKeysCount: enrichedSlider ? Object.keys(enrichedSlider).length : 0
            });
            if (enrichedSlider) {
              console.warn('ContentGrid: Returning enriched Slider');
              return enrichedSlider;
            } else {
              console.warn('ContentGrid: getSliderById returned null, returning original item');
              return item;
            }
          } catch (error) {
            console.warn(`ContentGrid: Failed to enrich Slider ${item.sys.id}:`, error);
            return item; // Return original item on error
          }
        } else if (item.__typename === 'Post' && item.sys?.id) {
          console.warn('ContentGrid: Found Post to enrich:', item.sys.id, item);
          try {
            // Dynamically import Post API to avoid circular dependency
            const { getPostById } = await import('@/components/Post/PostApi');
            console.warn('ContentGrid: Calling getPostById for', item.sys.id);
            const enrichedPost = await getPostById(item.sys.id, preview);
            console.warn('ContentGrid: Post enrichment result:', {
              id: item.sys.id,
              hasEnrichedData: !!enrichedPost,
              hasTitle: !!enrichedPost?.title,
              hasSlug: !!enrichedPost?.slug,
              enrichedPost: enrichedPost
            });
            if (enrichedPost) {
              console.warn('ContentGrid: Returning enriched Post');
              return enrichedPost;
            } else {
              console.warn('ContentGrid: getPostById returned null, returning original item');
              return item;
            }
          } catch (error) {
            console.error(`Failed to enrich Post ${item.sys.id} in ContentGrid:`, error);
            return item; // Return original item on error
          }
        } else if (item.__typename === 'CtaGrid' && item.sys?.id) {
          console.warn('ContentGrid: Found CtaGrid to enrich:', item.sys.id);
          try {
            const { getCtaGridById } = await import('@/components/CtaGrid/CtaGridApi');
            const enrichedResult = await getCtaGridById(item.sys.id, preview);
            const enrichedItem = enrichedResult?.item;
            console.warn('ContentGrid: CtaGrid enrichment result:', {
              id: item.sys.id,
              hasEnrichedData: !!enrichedItem,
              hasTitle: !!enrichedItem?.title
            });
            return enrichedItem || item;
          } catch (error) {
            console.warn(`Failed to enrich CtaGrid ${item.sys.id} in ContentGrid:`, error);
            return item;
          }
        } else if (item.__typename === 'Profile' && item.sys?.id) {
          console.warn('ContentGrid: Found Profile to enrich:', item.sys.id);
          try {
            const { getProfileById } = await import('@/components/Profile/ProfileApi');
            const enrichedItem = await getProfileById(item.sys.id, preview);
            console.warn('ContentGrid: Profile enrichment result:', {
              id: item.sys.id,
              hasEnrichedData: !!enrichedItem,
              hasTitle: !!enrichedItem?.title,
              hasName: !!enrichedItem?.name
            });
            return enrichedItem || item;
          } catch (error) {
            console.warn(`Failed to enrich Profile ${item.sys.id} in ContentGrid:`, error);
            return item;
          }
        } else if (item.__typename === 'Accordion' && item.sys?.id) {
          console.warn('ContentGrid: Found Accordion to enrich:', item.sys.id);
          try {
            const { getAccordionById } = await import('@/components/Accordion/AccordionApi');
            const enrichedItem = await getAccordionById(item.sys.id, preview);
            console.warn('ContentGrid: Accordion enrichment result:', {
              id: item.sys.id,
              hasEnrichedData: !!enrichedItem,
              hasTitle: !!enrichedItem?.title,
              hasItemsCollection: !!enrichedItem?.itemsCollection
            });
            return enrichedItem || item;
          } catch (error) {
            console.warn(`Failed to enrich Accordion ${item.sys.id} in ContentGrid:`, error);
            return item;
          }
        } else if (item.__typename === 'ContentSliderItem' && item.sys?.id) {
          console.warn('ContentGrid: Found ContentSliderItem to enrich:', item.sys.id);
          try {
            const { getContentSliderItemById } = await import('@/components/Slider/components/ContentSliderItemApi');
            const enrichedItem = await getContentSliderItemById(item.sys.id, preview);
            console.warn('ContentGrid: ContentSliderItem enrichment result:', {
              id: item.sys.id,
              hasEnrichedData: !!enrichedItem,
              hasTitle: !!enrichedItem?.title
            });
            return enrichedItem || item;
          } catch (error) {
            console.warn(`Failed to enrich ContentSliderItem ${item.sys.id} in ContentGrid:`, error);
            return item;
          }
        } else if (item.__typename === 'Testimonials' && item.sys?.id) {
          console.warn('ContentGrid: Found Testimonials to enrich:', item.sys.id);
          try {
            const { getTestimonialsById } = await import('@/components/Testimonials/TestimonialsApi');
            const enrichedItem = await getTestimonialsById(item.sys.id, preview);
            console.warn('ContentGrid: Testimonials enrichment result:', {
              id: item.sys.id,
              hasEnrichedData: !!enrichedItem,
              hasTitle: !!enrichedItem?.title
            });
            return enrichedItem || item;
          } catch (error) {
            console.warn(`Failed to enrich Testimonials ${item.sys.id} in ContentGrid:`, error);
            return item;
          }
        } else if (item.__typename === 'Service' && item.sys?.id) {
          try {
            const { getServiceById } = await import('@/components/Service/ServiceApi');
            const enrichedItem = await getServiceById(item.sys.id, preview);
            return enrichedItem || item;
          } catch (error) {
            console.warn(`Failed to enrich Service ${item.sys.id} in ContentGrid:`, error);
            return item;
          }
        } else if (item.__typename === 'Solution' && item.sys?.id) {
          try {
            const { getSolutionById } = await import('@/components/Solution/SolutionApi');
            const enrichedItem = await getSolutionById(item.sys.id, preview);
            return enrichedItem || item;
          } catch (error) {
            console.warn(`Failed to enrich Solution ${item.sys.id} in ContentGrid:`, error);
            return item;
          }
        } else if (item.__typename === 'Event' && item.sys?.id) {
          try {
            console.warn(`ContentGrid: Found Event to enrich: ${item.sys.id}`, item);
            console.warn(`ContentGrid: Calling getEventById for ${item.sys.id}`);
            const { getEventById } = await import('@/components/Event/EventApi');
            const enrichedItem = await getEventById(item.sys.id, preview);
            console.warn(`ContentGrid: Event enrichment result:`, {
              id: item.sys.id,
              hasEnrichedData: !!enrichedItem,
              hasTitle: !!enrichedItem?.title,
              hasSlug: !!enrichedItem?.slug,
              enrichedEvent: enrichedItem
            });
            console.warn(`ContentGrid: Returning enriched Event`);
            return enrichedItem || item;
          } catch (error) {
            console.warn(`Failed to enrich Event ${item.sys.id} in ContentGrid:`, error);
            return item;
          }
        } else if (item.__typename === 'ContentGridItem' && item.sys?.id) {
          try {
            const { getContentGridItemById } = await import('@/components/ContentGrid/ContentGridApi');
            const enrichedItem = await getContentGridItemById(item.sys.id, preview);
            return enrichedItem || item;
          } catch (error) {
            console.warn(`Failed to enrich ContentGridItem ${item.sys.id} in ContentGrid:`, error);
            return item;
          }
        } else if (item.__typename === 'ContactCard' && item.sys?.id) {
          try {
            console.warn(`ContentGrid: Enriching ContactCard ${item.sys.id}`);
            const { getContactCardById } = await import('@/components/ContactCard/ContactCardApi');
            const enrichedItem = await getContactCardById(item.sys.id, preview);
            console.warn(`ContentGrid: ContactCard ${item.sys.id} enriched successfully:`, { hasTitle: !!enrichedItem?.title });
            return enrichedItem || item;
          } catch (error) {
            console.warn(`Failed to enrich ContactCard ${item.sys.id} in ContentGrid:`, error);
            return item;
          }
        } else if (item.__typename === 'Image' && item.sys?.id) {
          try {
            const { getImageById } = await import('@/components/Image/ImageApi');
            const enrichedItem = await getImageById(item.sys.id, preview);
            return enrichedItem || item;
          } catch (error) {
            console.warn(`Failed to enrich Image ${item.sys.id} in ContentGrid:`, error);
            return item;
          }
        } else if (item.__typename === 'OfficeLocation' && item.sys?.id) {
          try {
            const { getLocationById } = await import('@/components/OfficeLocation/OfficeLocationApi');
            const enrichedItem = await getLocationById(item.sys.id, preview);
            return enrichedItem || item;
          } catch (error) {
            console.warn(`Failed to enrich OfficeLocation ${item.sys.id} in ContentGrid:`, error);
            return item;
          }
        } else if (item.__typename === 'PageList' && item.sys?.id) {
          try {
            const { getPageListById } = await import('@/components/PageList/PageListApi');
            const enrichedItem = await getPageListById(item.sys.id, preview);
            return enrichedItem || item;
          } catch (error) {
            console.warn(`Failed to enrich PageList ${item.sys.id} in ContentGrid:`, error);
            return item;
          }
        } else if (item.__typename === 'Video' && item.sys?.id) {
          try {
            const { getVideoById } = await import('@/components/Video/VideoApi');
            const enrichedItem = await getVideoById(item.sys.id, preview);
            return enrichedItem || item;
          } catch (error) {
            console.warn(`Failed to enrich Video ${item.sys.id} in ContentGrid:`, error);
            return item;
          }
        }
        return item; // Return non-enrichable items as-is
      });

      // Wait for all enrichments to complete
      const enrichedItems = await Promise.all(enrichmentPromises);
      console.warn(`ContentGrid: Enrichment completed. Original items:`, contentGrid.itemsCollection?.items?.length);
      console.warn(`ContentGrid: Enriched items:`, enrichedItems.length);
      console.warn(`ContentGrid: Enriched ContactCards:`, enrichedItems.filter(item => item.__typename === 'ContactCard').map(item => ({ id: item.sys?.id, hasTitle: !!item.title })));
      
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
              console.warn('ContentGrid Collection: Found Slider to enrich:', item.sys.id, {
                hasTitle: !!item.title,
                hasItemsCollection: !!item.itemsCollection,
                itemsCount: item.itemsCollection?.items?.length || 0,
                originalKeysCount: Object.keys(item).length
              });
              try {
                // Enrich Slider with full item data
                console.warn('ContentGrid Collection: Calling getSliderById for', item.sys.id);
                const enrichedSlider = await getSliderById(item.sys.id, preview);
                console.warn('ContentGrid Collection: Slider enrichment result:', {
                  id: item.sys.id,
                  hasEnrichedData: !!enrichedSlider,
                  hasTitle: !!enrichedSlider?.title,
                  hasItemsCollection: !!enrichedSlider?.itemsCollection,
                  itemsCount: enrichedSlider?.itemsCollection?.items?.length || 0,
                  enrichedKeysCount: enrichedSlider ? Object.keys(enrichedSlider).length : 0
                });
                if (enrichedSlider) {
                  console.warn('ContentGrid Collection: Returning enriched Slider');
                  return enrichedSlider;
                } else {
                  console.warn('ContentGrid Collection: getSliderById returned null, returning original item');
                  return item;
                }
              } catch (error) {
                console.warn(`ContentGrid Collection: Failed to enrich Slider ${item.sys.id}:`, error);
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
            } else if (item.__typename === 'CtaGrid' && item.sys?.id) {
              try {
                const { getCtaGridById } = await import('@/components/CtaGrid/CtaGridApi');
                const enrichedResult = await getCtaGridById(item.sys.id, preview);
                const enrichedItem = enrichedResult?.item;
                return enrichedItem || item;
              } catch (error) {
                console.warn(`Failed to enrich CtaGrid ${item.sys.id} in ContentGrid collection:`, error);
                return item;
              }
            } else if (item.__typename === 'Profile' && item.sys?.id) {
              try {
                const { getProfileById } = await import('@/components/Profile/ProfileApi');
                const enrichedItem = await getProfileById(item.sys.id, preview);
                return enrichedItem || item;
              } catch (error) {
                console.warn(`Failed to enrich Profile ${item.sys.id} in ContentGrid collection:`, error);
                return item;
              }
            } else if (item.__typename === 'Accordion' && item.sys?.id) {
              try {
                const { getAccordionById } = await import('@/components/Accordion/AccordionApi');
                const enrichedItem = await getAccordionById(item.sys.id, preview);
                return enrichedItem || item;
              } catch (error) {
                console.warn(`Failed to enrich Accordion ${item.sys.id} in ContentGrid collection:`, error);
                return item;
              }
            } else if (item.__typename === 'ContentSliderItem' && item.sys?.id) {
              try {
                const { getContentSliderItemById } = await import('@/components/Slider/components/ContentSliderItemApi');
                const enrichedItem = await getContentSliderItemById(item.sys.id, preview);
                return enrichedItem || item;
              } catch (error) {
                console.warn(`Failed to enrich ContentSliderItem ${item.sys.id} in ContentGrid collection:`, error);
                return item;
              }
            } else if (item.__typename === 'Testimonials' && item.sys?.id) {
              try {
                const { getTestimonialsById } = await import('@/components/Testimonials/TestimonialsApi');
                const enrichedItem = await getTestimonialsById(item.sys.id, preview);
                return enrichedItem || item;
              } catch (error) {
                console.warn(`Failed to enrich Testimonials ${item.sys.id} in ContentGrid collection:`, error);
                return item;
              }
            } else if (item.__typename === 'Product' && item.sys?.id) {
              try {
                const { getProductById } = await import('@/components/Product/ProductApi');
                const enrichedItem = await getProductById(item.sys.id, preview);
                return enrichedItem || item;
              } catch (error) {
                console.warn(`Failed to enrich Product ${item.sys.id} in ContentGrid collection:`, error);
                return item;
              }
            } else if (item.__typename === 'Service' && item.sys?.id) {
              try {
                const { getServiceById } = await import('@/components/Service/ServiceApi');
                const enrichedItem = await getServiceById(item.sys.id, preview);
                return enrichedItem || item;
              } catch (error) {
                console.warn(`Failed to enrich Service ${item.sys.id} in ContentGrid collection:`, error);
                return item;
              }
            } else if (item.__typename === 'Solution' && item.sys?.id) {
              try {
                const { getSolutionById } = await import('@/components/Solution/SolutionApi');
                const enrichedItem = await getSolutionById(item.sys.id, preview);
                return enrichedItem || item;
              } catch (error) {
                console.warn(`Failed to enrich Solution ${item.sys.id} in ContentGrid collection:`, error);
                return item;
              }
            } else if (item.__typename === 'Event' && item.sys?.id) {
              try {
                console.warn(`ContentGrid Collection: Found Event to enrich: ${item.sys.id}`, item);
                console.warn(`ContentGrid Collection: Calling getEventById for ${item.sys.id}`);
                const { getEventById } = await import('@/components/Event/EventApi');
                const enrichedItem = await getEventById(item.sys.id, preview);
                console.warn(`ContentGrid Collection: Event enrichment result:`, {
                  id: item.sys.id,
                  hasEnrichedData: !!enrichedItem,
                  hasTitle: !!enrichedItem?.title,
                  hasSlug: !!enrichedItem?.slug,
                  enrichedEvent: enrichedItem
                });
                console.warn(`ContentGrid Collection: Returning enriched Event`);
                return enrichedItem || item;
              } catch (error) {
                console.warn(`Failed to enrich Event ${item.sys.id} in ContentGrid collection:`, error);
                return item;
              }
            } else if (item.__typename === 'ContactCard' && item.sys?.id) {
              try {
                console.warn(`ContentGrid Collection: Enriching ContactCard ${item.sys.id}`);
                const { getContactCardById } = await import('@/components/ContactCard/ContactCardApi');
                const enrichedItem = await getContactCardById(item.sys.id, preview);
                console.warn(`ContentGrid Collection: ContactCard ${item.sys.id} enriched successfully:`, { hasTitle: !!enrichedItem?.title });
                return enrichedItem || item;
              } catch (error) {
                console.warn(`Failed to enrich ContactCard ${item.sys.id} in ContentGrid collection:`, error);
                return item;
              }
            } else if (item.__typename === 'Image' && item.sys?.id) {
              try {
                const { getImageById } = await import('@/components/Image/ImageApi');
                const enrichedItem = await getImageById(item.sys.id, preview);
                return enrichedItem || item;
              } catch (error) {
                console.warn(`Failed to enrich Image ${item.sys.id} in ContentGrid collection:`, error);
                return item;
              }
            } else if (item.__typename === 'OfficeLocation' && item.sys?.id) {
              try {
                const { getLocationById } = await import('@/components/OfficeLocation/OfficeLocationApi');
                const enrichedItem = await getLocationById(item.sys.id, preview);
                return enrichedItem || item;
              } catch (error) {
                console.warn(`Failed to enrich OfficeLocation ${item.sys.id} in ContentGrid collection:`, error);
                return item;
              }
            } else if (item.__typename === 'PageList' && item.sys?.id) {
              try {
                const { getPageListById } = await import('@/components/PageList/PageListApi');
                const enrichedItem = await getPageListById(item.sys.id, preview);
                return enrichedItem || item;
              } catch (error) {
                console.warn(`Failed to enrich PageList ${item.sys.id} in ContentGrid collection:`, error);
                return item;
              }
            } else if (item.__typename === 'Video' && item.sys?.id) {
              try {
                const { getVideoById } = await import('@/components/Video/VideoApi');
                const enrichedItem = await getVideoById(item.sys.id, preview);
                return enrichedItem || item;
              } catch (error) {
                console.warn(`Failed to enrich Event ${item.sys.id} in ContentGrid collection:`, error);
                return item;
              }
            } else if (item.__typename === 'ContentGridItem' && item.sys?.id) {
              try {
                const { getContentGridItemById } = await import('@/components/ContentGrid/ContentGridApi');
                const enrichedItem = await getContentGridItemById(item.sys.id, preview);
                return enrichedItem || item;
              } catch (error) {
                console.warn(`Failed to enrich ContentGridItem ${item.sys.id} in ContentGrid collection:`, error);
                return item;
              }
            }
            return item; // Return non-enrichable items as-is
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
    // Check if this is actually a ContentGrid (not ContentGridItem)
    // If so, use the full enrichment function
    const contentGrid = await getContentGridById(id, preview);
    if (contentGrid) {
      console.warn('ContentGrid: getContentGridItemById found ContentGrid, returning enriched version');
      // Transform ContentGrid to ContentGridItem format
      return {
        ...contentGrid,
        heading: typeof contentGrid.heading === 'object' ? contentGrid.heading?.title || '' : contentGrid.heading || ''
      } as ContentGridItem;
    }
    
    // Fallback to original ContentGridItem query
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
