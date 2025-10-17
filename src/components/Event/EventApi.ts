import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS, ASSET_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { AGENDA_ITEM_GRAPHQL_FIELDS } from '@/components/AgendaItem/AgendaItemApi';
import { IMAGE_GRAPHQL_FIELDS } from '@/components/Image/ImageApi';
import { HUBSPOTFORM_GRAPHQL_FIELDS } from '@/components/Forms/HubspotForm/HubspotFormApi';
import { POST_GRAPHQL_FIELDS_SIMPLE } from '@/components/Post/PostApi';
import { BUTTON_GRAPHQL_FIELDS } from '@/components/Button/ButtonApi';
import { VIDEO_GRAPHQL_FIELDS } from '@/components/Video/VideoApi';
import { LOCATION_GRAPHQL_FIELDS } from '@/components/OfficeLocation/OfficeLocationApi';
import { CONTACT_CARD_GRAPHQL_FIELDS } from '@/components/ContactCard/ContactCardApi';
import { SLIDER_GRAPHQL_FIELDS_SIMPLE } from '@/components/Slider/SliderApi';

import type { Event, EventResponse } from '@/components/Event/EventSchema';

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
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching events: ${error.message}`);
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
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching event by slug: ${error.message}`);
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
        event(id: $id, preview: $preview) {
          ${EVENT_GRAPHQL_FIELDS}
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

    // For single event queries, the data structure is different
    // We need to get the first item from eventCollection
    if (!data.eventCollection?.items?.length) {
      return null;
    }
    return data.eventCollection.items[0]!;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Event: ${error.message}`);
    }
    throw new Error('Unknown error fetching Event');
  }
}
