import { CONTENTSLIDERITEM_GRAPHQL_FIELDS } from './components/ContentSliderItemApi';

import { fetchGraphQL } from '@/lib/api';
import { ASSET_FIELDS, SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { BUTTON_GRAPHQL_FIELDS } from '@/components/Button/ButtonApi';
import { IMAGE_GRAPHQL_FIELDS } from '@/components/Image/ImageApi';
import { POST_SLIDER_GRAPHQL_FIELDS } from '@/components/Post/PostApi';
import { SOLUTION_GRAPHQL_FIELDS } from '@/components/Solution/SolutionApi';
import { TEAM_MEMBER_GRAPHQL_FIELDS } from '@/components/TeamMember/TeamMemberApi';
import { TESTIMONIALITEM_GRAPHQL_FIELDS } from '@/components/Testimonials/TestimonialsApi';
import { TIMELINE_SLIDERITEM_GRAPHQL_FIELDS } from '@/components/TimelineSlider/TimelineSliderItemApi';

import type { SliderItem } from '@/components/Slider/SliderItemSchema';

// Simplified Product fields for individual Product queries (to stay within Contentful query size limit)
const SLIDERITEM_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  icon {
    ${ASSET_FIELDS}
  }
  title
  description
  cta {
    ${BUTTON_GRAPHQL_FIELDS}
  }
  variant
`;

// Minimal slider item fields with inline fragments for union types
export const SLIDERITEM_GRAPHQL_FIELDS_SIMPLE = `
  ... on ContentSliderItem {
    ${CONTENTSLIDERITEM_GRAPHQL_FIELDS} 
  }
  ... on Image {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  ... on Post {
    ${POST_SLIDER_GRAPHQL_FIELDS}
  }
  ... on SliderItem {
    ${SLIDERITEM_GRAPHQL_FIELDS}
  }
  ... on Solution {
    ${SOLUTION_GRAPHQL_FIELDS}
  }
  ... on TimelineSliderItem {
    ${TIMELINE_SLIDERITEM_GRAPHQL_FIELDS}
  }
  ... on TeamMember {
    ${TEAM_MEMBER_GRAPHQL_FIELDS}
  }
  ... on TestimonialItem {
    ${TESTIMONIALITEM_GRAPHQL_FIELDS}
  }
`;

/**
 * Fetches a single SliderItem by ID from Contentful
 * @param id - The ID of the SliderItem to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to SliderItem or null if not found
 */
export async function getSliderItemById(id: string, preview = false): Promise<SliderItem | null> {
  try {
    const response = await fetchGraphQL<SliderItem>(
      `query GetSliderItemById($id: String!, $preview: Boolean!) {
        sliderItem(id: $id, preview: $preview) {
          ${SLIDERITEM_GRAPHQL_FIELDS}
        }   
      }`,
      { id, preview },
      preview
    );

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    const data = response.data as unknown as { sliderItem?: SliderItem };

    if (!data.sliderItem) {
      return null;
    }

    return data.sliderItem;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching SliderItem: ${_error.message}`);
    }
    throw new Error('Unknown error fetching SliderItem');
  }
}
