import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { SLIDERITEM_GRAPHQL_FIELDS_SIMPLE } from '@/components/Slider/SliderItemApi';

import type { Slider } from '@/components/Slider/SliderSchema';

// Minimal slider fields for ContentGrid queries
export const SLIDER_GRAPHQL_FIELDS_SIMPLE = `
  ${SYS_FIELDS}
  title
  itemsCollection {
    items {
      ${SLIDERITEM_GRAPHQL_FIELDS_SIMPLE}
    }
  }
`;

// Minimal slider fields for initial fetch (server-side lazy loading)
export const SLIDER_MINIMAL_FIELDS = `
  ${SYS_FIELDS}
  title
  autoplay
  delay
  itemsCollection {
    items {
      __typename
      ... on Entry {
        ${SYS_FIELDS}
      }
      ... on ContentSliderItem {
        ${SYS_FIELDS}
        title
        description
      }
    }
  }
`;

// Full slider fields for dedicated slider queries
export const SLIDER_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  autoplay
  delay
  itemsCollection {
    items {
      ${SLIDERITEM_GRAPHQL_FIELDS_SIMPLE}
    }
  }
`;

/**
 * Fetches Slider data separately by IDs to avoid QUERY_TOO_BIG errors
 * @param sliderIds - Array of Slider IDs to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to array of Slider objects
 */
export async function getSlidersByIds(sliderIds: string[], preview = false): Promise<Slider[]> {
  if (sliderIds.length === 0) {
    return [];
  }

  const query = `
    query GetSlidersByIds($ids: [String!]!, $preview: Boolean!) {
      sliderCollection(where: { sys: { id_in: $ids } }, preview: $preview) {
        items {
          ${SLIDER_MINIMAL_FIELDS}
        }
      }
    }
  `;

  try {
    const response = await fetchGraphQL(query, {
      ids: sliderIds,
      preview
    });

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to help TypeScript understand the structure
    const data = response.data as unknown as {
      sliderCollection?: { items?: Slider[] };
    };

    // Validate the data structure
    if (!data.sliderCollection?.items?.length) {
      throw new ContentfulError('Failed to fetch Sliders from Contentful');
    }

    return data.sliderCollection.items;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Sliders: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Sliders');
  }
}

/**
 * Fetches a single Slider by ID from Contentful
 * @param id - The ID of the Slider to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to Slider or null if not found
 */
/**
 * Fetches a Slider with server-side lazy loading to avoid GraphQL complexity
 * Step 1: Fetch minimal structure with only sys.id for items
 * Step 2: Enrich items in parallel with individual API calls
 * Step 3: Return complete enriched Slider
 */
export async function getSliderById(id: string, preview = false): Promise<Slider | null> {
  try {
    // Step 1: Fetch minimal slider structure
    const response = await fetchGraphQL(
      `query GetSliderMinimal($id: String!, $preview: Boolean!) {
        slider(id: $id, preview: $preview) {
          ${SLIDER_MINIMAL_FIELDS}
        }
      }`,
      { id, preview },
      preview
    );

    // Check for valid response
    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion
    const data = response.data as unknown as { slider?: any };

    // Return null if slider not found
    if (!data.slider) {
      return null;
    }

    const slider = data.slider;

    // Step 2: Enrich slider items in parallel (server-side lazy loading)
    if (slider.itemsCollection?.items?.length > 0) {
      console.log(
        'Slider API: Starting enrichment for',
        slider.itemsCollection.items.length,
        'slider items'
      );
      const enrichmentPromises = slider.itemsCollection.items.map(async (item: any) => {
        console.log('Slider API: Processing slider item:', item.__typename, item.sys?.id);
        if (!item.sys?.id || !item.__typename) {
          console.log('Slider API: Skipping item without proper structure:', item);
          return item; // Skip items without proper structure
        }

        try {
          // Enrich each item type individually to avoid GraphQL complexity
          switch (item.__typename) {
            case 'Post': {
              // Import and use Post API
              const { getPostById } = await import('@/components/Post/PostApi');
              const enrichedPost = await getPostById(item.sys.id, preview);
              return enrichedPost || item;
            }

            case 'Image': {
              // Import and use Image API
              const { getImageById } = await import('@/components/Image/ImageApi');
              console.log('Slider API: Enriching Image', item.sys.id);
              const enrichedImage = await getImageById(item.sys.id, preview);
              console.log('Slider API: Image enriched:', {
                id: item.sys.id,
                hasEnrichedData: !!enrichedImage,
                hasTitle: !!enrichedImage?.title,
                hasLink: !!enrichedImage?.link,
                keysCount: enrichedImage ? Object.keys(enrichedImage).length : 0
              });
              return enrichedImage || item;
            }

            case 'Solution': {
              // Import and use Solution API
              const { getSolutionById } = await import('@/components/Solution/SolutionApi');
              const enrichedSolution = await getSolutionById(item.sys.id, preview);
              return enrichedSolution || item;
            }

            case 'TeamMember': {
              // Import and use TeamMember API
              const { getTeamMemberById } = await import('@/components/TeamMember/TeamMemberApi');
              const enrichedTeamMember = await getTeamMemberById(item.sys.id, preview);
              return enrichedTeamMember || item;
            }

            case 'SliderItem': {
              // Import and use SliderItem API
              const { getSliderItemById } = await import('@/components/Slider/SliderItemApi');
              console.log('Slider API: Enriching SliderItem', item.sys.id);
              const enrichedSliderItem = await getSliderItemById(item.sys.id, preview);
              console.log('Slider API: SliderItem enriched:', {
                id: item.sys.id,
                hasEnrichedData: !!enrichedSliderItem,
                keysCount: enrichedSliderItem ? Object.keys(enrichedSliderItem).length : 0
              });
              return enrichedSliderItem || item;
            }

            case 'CtaGrid': {
              // Import and use CtaGrid API
              const { getCtaGridById } = await import('@/components/CtaGrid/CtaGridApi');
              console.log('Slider API: Enriching CtaGrid', item.sys.id);
              const enrichedResult = await getCtaGridById(item.sys.id, preview);
              const enrichedItem = enrichedResult?.item;
              console.log('Slider API: CtaGrid enriched:', {
                id: item.sys.id,
                hasEnrichedData: !!enrichedItem,
                keysCount: enrichedItem ? Object.keys(enrichedItem).length : 0
              });
              return enrichedItem || item;
            }

            case 'Profile': {
              // Import and use Profile API
              const { getProfileById } = await import('@/components/Profile/ProfileApi');
              console.log('Slider API: Enriching Profile', item.sys.id);
              const enrichedItem = await getProfileById(item.sys.id, preview);
              console.log('Slider API: Profile enriched:', {
                id: item.sys.id,
                hasEnrichedData: !!enrichedItem,
                hasName: !!enrichedItem?.name,
                keysCount: enrichedItem ? Object.keys(enrichedItem).length : 0
              });
              return enrichedItem || item;
            }

            case 'Accordion': {
              // Import and use Accordion API
              const { getAccordionById } = await import('@/components/Accordion/AccordionApi');
              console.log('Slider API: Enriching Accordion', item.sys.id);
              const enrichedItem = await getAccordionById(item.sys.id, preview);
              console.log('Slider API: Accordion enriched:', {
                id: item.sys.id,
                hasEnrichedData: !!enrichedItem,
                hasItemsCollection: !!enrichedItem?.itemsCollection,
                keysCount: enrichedItem ? Object.keys(enrichedItem).length : 0
              });
              return enrichedItem || item;
            }

            case 'ContentGridItem': {
              // Import and use ContentGridItem API
              const { getContentGridItemById } = await import(
                '@/components/ContentGrid/ContentGridApi'
              );
              console.log('Slider API: Enriching ContentGridItem', item.sys.id);
              const enrichedItem = await getContentGridItemById(item.sys.id, preview);
              console.log('Slider API: ContentGridItem enriched:', {
                id: item.sys.id,
                hasEnrichedData: !!enrichedItem,
                hasTitle: !!enrichedItem?.title,
                keysCount: enrichedItem ? Object.keys(enrichedItem).length : 0
              });
              return enrichedItem || item;
            }

            case 'ContentSliderItem': {
              // Import and use ContentSliderItem API
              const { getContentSliderItemById } = await import(
                '@/components/Slider/components/ContentSliderItemApi'
              );
              console.log('Slider API: Enriching ContentSliderItem', item.sys.id);
              const enrichedItem = await getContentSliderItemById(item.sys.id, preview);
              console.log('Slider API: ContentSliderItem enriched:', {
                id: item.sys.id,
                hasEnrichedData: !!enrichedItem,
                hasTitle: !!enrichedItem?.title,
                keysCount: enrichedItem ? Object.keys(enrichedItem).length : 0
              });
              return enrichedItem || item;
            }

            default:
              // For other types, return minimal structure
              console.log('Slider API: Unknown item type, returning as-is:', item.__typename);
              return item;
          }
        } catch (error) {
          console.warn(`Failed to enrich ${item.__typename} item ${item.sys.id}:`, error);
          return item; // Return original item on error
        }
      });

      // Wait for all enrichments to complete
      const enrichedItems = await Promise.all(enrichmentPromises);

      // Update slider with enriched items
      slider.itemsCollection.items = enrichedItems;
    }

    return slider as Slider;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Slider: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Slider');
  }
}
