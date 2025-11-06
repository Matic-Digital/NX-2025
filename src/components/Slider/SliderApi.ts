import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { SLIDERITEM_GRAPHQL_FIELDS_SIMPLE } from '@/components/Slider/SliderItemApi';

import type { Slider } from '@/components/Slider/SliderSchema';

// Minimal slider fields for ContentGrid queries
export const SLIDER_GRAPHQL_FIELDS_SIMPLE = `
  ${SYS_FIELDS}
  title
  itemsCollection(limit: 50) {
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
  itemsCollection(limit: 50) {
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
  itemsCollection(limit: 50) {
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
      // Starting enrichment for slider items
      
      const enrichmentPromises = slider.itemsCollection.items.map(async (item: any) => {
        // Processing slider item
        if (!item.sys?.id || !item.__typename) {
          return item; // Skip items without proper structure
        }

        try {
          // Enrich each item type individually to avoid GraphQL complexity
          // Only enrich types defined in SliderSchema union
          switch (item.__typename) {
            case 'Post': {
              // Import and use Post API (PostSliderItemSchema)
              const { getPostById } = await import('@/components/Post/PostApi');
              const enrichedPost = await getPostById(item.sys.id, preview);
              return enrichedPost || item;
            }

            case 'Image': {
              // Import and use Image API (ImageSchema)
              const { getImageById } = await import('@/components/Image/ImageApi');
              const enrichedImage = await getImageById(item.sys.id, preview);
              return enrichedImage || item;
            }

            case 'Solution': {
              // Import and use Solution API (SolutionSchema)
              const { getSolutionById } = await import('@/components/Solution/SolutionApi');
              const enrichedSolution = await getSolutionById(item.sys.id, preview);
              return enrichedSolution || item;
            }

            case 'TeamMember': {
              // Import and use TeamMember API (TeamMemberSchema)
              const { getTeamMemberById } = await import('@/components/TeamMember/TeamMemberApi');
              const enrichedTeamMember = await getTeamMemberById(item.sys.id, preview);
              return enrichedTeamMember || item;
            }

            case 'SliderItem': {
              // Import and use SliderItem API (SliderItemSchema)
              const { getSliderItemById } = await import('@/components/Slider/SliderItemApi');
              const enrichedSliderItem = await getSliderItemById(item.sys.id, preview);
              return enrichedSliderItem || item;
            }

            case 'ContentSliderItem': {
              // Import and use ContentSliderItem API (ContentSliderItemSchema)
              const { getContentSliderItemById } = await import(
                '@/components/Slider/components/ContentSliderItemApi'
              );
              const enrichedItem = await getContentSliderItemById(item.sys.id, preview);
              return enrichedItem || item;
            }

            case 'TestimonialItem': {
              // Import and use TestimonialItem API (TestimonialItemSchema)
              const { getTestimonialItemById } = await import('@/components/Testimonials/TestimonialsApi');
              const enrichedItem = await getTestimonialItemById(item.sys.id, preview);
              return enrichedItem || item;
            }

            case 'TimelineSliderItem': {
              // Import and use TimelineSliderItem API (TimelineSliderItemSchema)
              const { getTimelineSliderItemById } = await import('@/components/TimelineSlider/TimelineSliderItemApi');
              const enrichedItem = await getTimelineSliderItemById(item.sys.id, preview);
              return enrichedItem || item;
            }

            default:
              // For other types, return minimal structure
              return item;
          }
        } catch (error) {
          return item; // Return original item if enrichment fails
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
