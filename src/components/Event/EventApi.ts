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
import { SLIDER_GRAPHQL_FIELDS_SIMPLE } from '@/components/Slider/SliderApi';
import { VIDEO_GRAPHQL_FIELDS } from '@/components/Video/VideoApi';

import type { Event, EventResponse } from '@/components/Event/EventSchema';
import type { Post } from '@/components/Post/PostSchema';

// Post fields for event post categories (includes gatedContentForm for Case Study filtering)
const EVENT_POST_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  slug
  datePublished
  externalLink
  mainImage {
    ${IMAGE_GRAPHQL_FIELDS}
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
    ${SLIDER_GRAPHQL_FIELDS_SIMPLE}
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

    return data.eventCollection.items[0]!;
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
    return data.eventCollection.items[0]!;
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
