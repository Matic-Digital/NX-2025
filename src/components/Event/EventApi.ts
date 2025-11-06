import { fetchGraphQL } from '@/lib/api';
import { ASSET_FIELDS, SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { AGENDA_ITEM_GRAPHQL_FIELDS } from '@/components/AgendaItem/AgendaItemApi';
import { BUTTON_GRAPHQL_FIELDS } from '@/components/Button/ButtonApi';
import { CONTACT_CARD_GRAPHQL_FIELDS } from '@/components/ContactCard/ContactCardApi';
import { HUBSPOTFORM_GRAPHQL_FIELDS } from '@/components/Forms/HubspotForm/HubspotFormApi';
import { IMAGE_GRAPHQL_FIELDS } from '@/components/Image/ImageApi';
import { LOCATION_GRAPHQL_FIELDS } from '@/components/OfficeLocation/OfficeLocationApi';
import { POST_GRAPHQL_FIELDS_SIMPLE } from '@/components/Post/PostApi';
import { SLIDER_MINIMAL_FIELDS } from '@/components/Slider/SliderApi';
import { VIDEO_GRAPHQL_FIELDS } from '@/components/Video/VideoApi';

import type { Event, EventResponse } from '@/components/Event/EventSchema';
import type { Post } from '@/components/Post/PostSchema';

// Post fields for event post categories (simplified to avoid GraphQL complexity)
const EVENT_POST_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  slug
  datePublished
  externalLink
  mainImage {
    ${SYS_FIELDS}
    title
    link
    altText
  }
  categories
  gatedContentForm {
    ${SYS_FIELDS}
  }
`;

// Event fields for collections/listings
export const EVENT_MINIMAL_FIELDS = `
  ${SYS_FIELDS}
  title
  slug
  dateTime
  endDateTime
  template
`;

// Full event fields
export const EVENT_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  slug
  dateIcon {
    ${ASSET_FIELDS}
  }
  dateTime
  endDateTime
  addressIcon {
    ${ASSET_FIELDS}
  }
  address
  addressSubline
  agendaHeadline
  agendaItemsCollection {
    items {
      ${AGENDA_ITEM_GRAPHQL_FIELDS}
    }
  }
  agendaFooter
  layout {
    ${SYS_FIELDS}
    header {
      ${SYS_FIELDS}
    }
    footer {
      ${SYS_FIELDS}
    }
  }
  template
  bannerImage {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  mainImage {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  mainImageCaption
  formCta {
    ${HUBSPOTFORM_GRAPHQL_FIELDS}
  }
  referencedPostsCollection {
    items {
      ${POST_GRAPHQL_FIELDS_SIMPLE}
    }
  }
  sectionHeadingTitle
  sectionHeadingDescription
  sectionHeadingButton {
    ${BUTTON_GRAPHQL_FIELDS}
  }
  landing1Asset {
    ... on Image {
      ${IMAGE_GRAPHQL_FIELDS}
    }
    ... on Video {
      ${VIDEO_GRAPHQL_FIELDS}
    }
  }
  sectionRichContent {
    json
  }
  contactHeadline
  officeLocation {
    ${LOCATION_GRAPHQL_FIELDS}
  }
  contactCardsCollection {
    items {
      ${CONTACT_CARD_GRAPHQL_FIELDS}
    }
  }
  slider {
    ${SLIDER_MINIMAL_FIELDS}
  }
  postCategories
  maxPostsPerCategory
`;

/**
 * Fetches all events from Contentful with minimal data (for collections/listings)
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to events response with minimal data
 */
export async function getAllEventsMinimal(preview = false): Promise<EventResponse> {
  try {
    const response = await fetchGraphQL<Event>(
      `query GetAllEventsMinimal($preview: Boolean!) {
        eventCollection(preview: $preview, order: dateTime_ASC) {
          items {
            ${EVENT_MINIMAL_FIELDS}
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
    const data = response.data as unknown as { eventCollection?: { items?: Event[] } };

    // Return empty array if no events found
    if (!data.eventCollection?.items) {
      return { items: [] };
    }

    return {
      items: data.eventCollection.items
    };
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching events: ${_error.message}`);
    }
    throw new Error('Unknown error fetching events');
  }
}

/**
 * Fetches an event by slug from Contentful
 * @param slug - The slug of the event to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the event or null if not found
 */
export async function getEventBySlug(slug: string, preview = false): Promise<Event | null> {
  try {
    const response = await fetchGraphQL<Event>(
      `query GetEventBySlug($slug: String!, $preview: Boolean!) {
        eventCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
          items {
            ${EVENT_GRAPHQL_FIELDS}
          }
        }
      }`,
      { slug, preview }
    );

    // Check for valid response
    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using the properly typed GraphQL response
    const data = response.data;

    // Return null if event not found
    if (!data.eventCollection?.items?.length) {
      return null;
    }

    const event = data.eventCollection.items[0]!;

    // Step 2: Enrich Post items in Event (server-side lazy loading) - Same as getEventById
    if (event.referencedPostsCollection?.items?.length && event.referencedPostsCollection.items.length > 0) {
      console.warn(`Event Detail: Enriching ${event.referencedPostsCollection.items.length} referenced posts for event ${event.slug}`);
      
      const enrichmentPromises = event.referencedPostsCollection.items.map(async (item: any) => {
        if (item.__typename === 'Post' && item.sys?.id) {
          try {
            console.warn(`Event Detail: Enriching Post ${item.sys.id}`);
            // Dynamically import Post API to avoid circular dependency
            const { getPostById } = await import('@/components/Post/PostApi');
            const enrichedPost = await getPostById(item.sys.id, preview);
            console.warn(`Event Detail: Post ${item.sys.id} enriched successfully:`, { hasTitle: !!enrichedPost?.title });
            return enrichedPost || item;
          } catch (error) {
            console.warn(`Failed to enrich Post ${item.sys.id} in Event:`, error);
            return item; // Return original item on error
          }
        }
        return item;
      });

      // Wait for all enrichments to complete
      const enrichedItems = await Promise.all(enrichmentPromises);
      if (event.referencedPostsCollection) {
        event.referencedPostsCollection.items = enrichedItems;
      }
      
      console.warn(`Event Detail: Completed enrichment of ${enrichedItems.length} posts`);
    }

    // Step 3: Enrich Slider if present
    if (event.slider && event.slider.sys?.id) {
      const sliderId = event.slider.sys.id;
      try {
        console.warn(`Event Detail: Enriching Slider ${sliderId}`);
        const { getSliderById } = await import('@/components/Slider/SliderApi');
        const enrichedSlider = await getSliderById(sliderId, preview);
        if (enrichedSlider) {
          event.slider = enrichedSlider as any;
          console.warn(`Event Detail: Slider enriched successfully`);
        }
      } catch (error) {
        console.warn(`Failed to enrich Slider ${sliderId} in Event:`, error);
      }
    }

    // Step 4: Pre-fetch post categories data for EventDetail (server-side)
    if (event.postCategories && event.postCategories.length > 0) {
      try {
        console.warn(`Event Detail: Pre-fetching posts for categories:`, event.postCategories);
        const postsByCategory = await getPostsByCategories(
          event.postCategories, 
          event.maxPostsPerCategory ?? 3, 
          preview
        );
        // Attach the pre-fetched data to the event object for EventDetail to use
        (event as any).preloadedPostsByCategory = postsByCategory;
        console.warn(`Event Detail: Pre-fetched posts for ${Object.keys(postsByCategory).length} categories`);
      } catch (error) {
        console.warn(`Failed to pre-fetch post categories for Event:`, error);
      }
    }

    // Step 5: Enrich ContactCard items if present
    if (event.contactCardsCollection?.items?.length && event.contactCardsCollection.items.length > 0) {
      try {
        console.warn(`Event Detail: Enriching ${event.contactCardsCollection.items.length} contact cards`);
        
        const enrichmentPromises = event.contactCardsCollection.items.map(async (item: any) => {
          if (item.__typename === 'ContactCard' && item.sys?.id) {
            try {
              console.warn(`Event Detail: Enriching ContactCard ${item.sys.id}`);
              const { getContactCardById } = await import('@/components/ContactCard/ContactCardApi');
              const enrichedContactCard = await getContactCardById(item.sys.id, preview);
              console.warn(`Event Detail: ContactCard ${item.sys.id} enriched successfully:`, { hasTitle: !!enrichedContactCard?.title });
              return enrichedContactCard || item;
            } catch (error) {
              console.warn(`Failed to enrich ContactCard ${item.sys.id} in Event:`, error);
              return item;
            }
          }
          return item;
        });

        const enrichedContactCards = await Promise.all(enrichmentPromises);
        if (event.contactCardsCollection) {
          event.contactCardsCollection.items = enrichedContactCards;
        }
        
        console.warn(`Event Detail: Completed enrichment of ${enrichedContactCards.length} contact cards`);
      } catch (error) {
        console.warn(`Failed to enrich contact cards for Event:`, error);
      }
    }

    return event;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching event by slug: ${_error.message}`);
    }
    throw new Error('Unknown error fetching event by slug');
  }
}

/**
 * Fetches an event by ID from Contentful
 * @param id - The ID of the event to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the event or null if not found
 */
export async function getEventById(id: string, preview = false): Promise<Event | null> {
  try {
    const response = await fetchGraphQL<Event>(
      `query GetEventById($id: String!, $preview: Boolean!) {
        eventCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            ${EVENT_GRAPHQL_FIELDS}
          }
        }
      }`,
      { id, preview },
      preview
    );

    // Check for valid response
    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using the properly typed GraphQL response
    const data = response.data;

    // For single event queries, get the first item from eventCollection
    if (!data.eventCollection?.items?.length) {
      return null;
    }
    
    const event = data.eventCollection.items[0]!;

    // Step 2: Enrich Post items in Event (server-side lazy loading)
    if (event.referencedPostsCollection?.items?.length && event.referencedPostsCollection.items.length > 0) {
      const enrichmentPromises = event.referencedPostsCollection.items.map(async (item: any) => {
        if (item.__typename === 'Post' && item.sys?.id) {
          try {
            // Dynamically import Post API to avoid circular dependency
            const { getPostById } = await import('@/components/Post/PostApi');
            const enrichedPost = await getPostById(item.sys.id, preview);
            return enrichedPost || item;
          } catch (error) {
            console.warn(`Failed to enrich Post ${item.sys.id} in Event:`, error);
            return item; // Return original item on error
          }
        }
        return item;
      });

      // Wait for all enrichments to complete
      const enrichedItems = await Promise.all(enrichmentPromises);
      if (event.referencedPostsCollection) {
        event.referencedPostsCollection.items = enrichedItems;
      }
    }

    // Step 3: Enrich Slider if present (same as getEventBySlug)
    if (event.slider && event.slider.sys?.id) {
      const sliderId = event.slider.sys.id;
      try {
        console.warn(`Event Preview: Enriching Slider ${sliderId}`);
        const { getSliderById } = await import('@/components/Slider/SliderApi');
        const enrichedSlider = await getSliderById(sliderId, preview);
        if (enrichedSlider) {
          event.slider = enrichedSlider as any;
          console.warn(`Event Preview: Slider enriched successfully`);
        }
      } catch (error) {
        console.warn(`Failed to enrich Slider ${sliderId} in Event:`, error);
      }
    }

    // Step 4: Pre-fetch post categories data for EventDetail (same as getEventBySlug)
    if (event.postCategories && event.postCategories.length > 0) {
      try {
        console.warn(`Event Preview: Pre-fetching posts for categories:`, event.postCategories);
        const postsByCategory = await getPostsByCategories(
          event.postCategories, 
          event.maxPostsPerCategory ?? 3, 
          preview
        );
        // Attach the pre-fetched data to the event object for EventDetail to use
        (event as any).preloadedPostsByCategory = postsByCategory;
        console.warn(`Event Preview: Pre-fetched posts for ${Object.keys(postsByCategory).length} categories`);
      } catch (error) {
        console.warn(`Failed to pre-fetch post categories for Event:`, error);
      }
    }

    // Step 5: Enrich ContactCard items if present (same as getEventBySlug)
    if (event.contactCardsCollection?.items?.length && event.contactCardsCollection.items.length > 0) {
      try {
        console.warn(`Event Preview: Enriching ${event.contactCardsCollection.items.length} contact cards`);
        
        const enrichmentPromises = event.contactCardsCollection.items.map(async (item: any) => {
          if (item.__typename === 'ContactCard' && item.sys?.id) {
            try {
              console.warn(`Event Preview: Enriching ContactCard ${item.sys.id}`);
              const { getContactCardById } = await import('@/components/ContactCard/ContactCardApi');
              const enrichedContactCard = await getContactCardById(item.sys.id, preview);
              console.warn(`Event Preview: ContactCard ${item.sys.id} enriched successfully:`, { hasTitle: !!enrichedContactCard?.title });
              return enrichedContactCard || item;
            } catch (error) {
              console.warn(`Failed to enrich ContactCard ${item.sys.id} in Event:`, error);
              return item;
            }
          }
          return item;
        });

        const enrichedContactCards = await Promise.all(enrichmentPromises);
        if (event.contactCardsCollection) {
          event.contactCardsCollection.items = enrichedContactCards;
        }
        
        console.warn(`Event Preview: Completed enrichment of ${enrichedContactCards.length} contact cards`);
      } catch (error) {
        console.warn(`Failed to enrich contact cards for Event:`, error);
      }
    }

    return event;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Event: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Event');
  }
}

/**
 * Maps Event category names (plural) to Post category names (singular)
 */
const eventCategoryToPostCategory: Record<string, string> = {
  Blogs: 'Blog',
  'Case Studies': 'Case Study',
  'Data Sheets': 'Data Sheet',
  Featured: 'Featured',
  'In The News': 'In The News',
  'Press Releases': 'Press Release',
  Video: 'Video',
  Whitepaper: 'Whitepaper'
};

/**
 * Fetches posts by categories for event Landing 1 template
 * @param categories - Array of event post categories to fetch
 * @param maxPerCategory - Maximum posts per category (default 3)
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to posts grouped by category
 */
export async function getPostsByCategories(
  categories: string[],
  maxPerCategory = 3,
  preview = false
): Promise<Record<string, Post[]>> {
  try {
    console.warn('Event API: getPostsByCategories called with:', { categories, maxPerCategory, preview });
    const postsByCategory: Record<string, Post[]> = {};

    // Fetch posts for each category
    for (const eventCategory of categories) {
      // Map event category to post category using secure property access
      const postCategory = Object.prototype.hasOwnProperty.call(
        eventCategoryToPostCategory,
        eventCategory
      )
        ? (Object.getOwnPropertyDescriptor(eventCategoryToPostCategory, eventCategory)?.value as
            | string
            | undefined)
        : undefined;
      if (!postCategory) {
        continue;
      }
      const response = await fetchGraphQL<{ postCollection: { items: unknown[] } }>(
        `query GetPostsByCategory($category: String!, $limit: Int!, $preview: Boolean!) {
          postCollection(
            where: { categories_contains_some: [$category] }, 
            limit: $limit, 
            order: datePublished_DESC,
            preview: $preview
          ) {
            items {
              ${EVENT_POST_GRAPHQL_FIELDS}
            }
          }
        }`,
        { category: postCategory, limit: maxPerCategory, preview },
        preview
      );

      if (response?.data?.postCollection?.items) {
        let posts = response.data.postCollection.items as unknown as Post[];

        // Filter Case Studies to only show those with external link or gated content form
        if (eventCategory === 'Case Studies') {
          posts = posts.filter(
            (post) => Boolean(post.externalLink) || Boolean(post.gatedContentForm?.sys?.id)
          );
        }

        // Store using the original event category name for display with secure assignment
        Object.defineProperty(postsByCategory, eventCategory, {
          value: posts,
          writable: true,
          enumerable: true,
          configurable: true
        });
      }
    }

    return postsByCategory;
  } catch {
    return {};
  }
}
