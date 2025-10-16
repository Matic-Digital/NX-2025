import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';

import { IMAGE_GRAPHQL_FIELDS } from '@/components/Image/ImageApi';
import {
  TestimonialItemSchema,
  TestimonialsSchema
} from '@/components/Testimonials/TestimonialsSchema';

import type { TestimonialItem, Testimonials } from '@/components/Testimonials/TestimonialsSchema';

export const TESTIMONIALITEM_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  quote
  authorName
  authorTitle
  headshot {
    ${IMAGE_GRAPHQL_FIELDS}
  }
`;

// Use centralized GraphQL fields
export const TESTIMONIALS_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  itemsCollection {
    items {
      ${TESTIMONIALITEM_GRAPHQL_FIELDS}
    }
  }
`;

/**
 * Fetch all testimonials from Contentful
 */
export async function getTestimonials(preview = false): Promise<Testimonials[]> {
  const query = `
    query GetTestimonials($preview: Boolean!) {
      testimonialsCollection(preview: $preview) {
        items {
          ${TESTIMONIALS_GRAPHQL_FIELDS}
        }
      }
    }
  `;

  const response = await fetchGraphQL(query, { preview });

  if (!response?.data) {
    return [];
  }

  const data = response.data as unknown as {
    testimonialsCollection?: { items?: Testimonials[] };
  };

  if (!data.testimonialsCollection?.items) {
    return [];
  }

  return data.testimonialsCollection.items.filter(Boolean).map((item, index) => {
    try {
      return TestimonialsSchema.parse(item);
    } catch (error) {
      console.error(`Zod validation error for item ${index}:`, error);
      console.error(`Failed item ${index}:`, JSON.stringify(item, null, 2));
      throw error;
    }
  });
}

/**
 * Fetch a single testimonials entry by ID
 */
export async function getTestimonialsById(
  id: string,
  preview = false
): Promise<Testimonials | null> {
  const query = `
    query GetTestimonialsById($id: String!, $preview: Boolean!) {
      testimonials(id: $id, preview: $preview) {
        ${TESTIMONIALS_GRAPHQL_FIELDS}
      }
    }
  `;

  try {
    const response = await fetchGraphQL(query, { id, preview });
    console.log('🔍 GraphQL Response:', response);

    if (!response?.data) {
      console.warn('No data in response');
      return null;
    }

    const data = response.data as unknown as { testimonials?: Testimonials };
    console.log('🔍 Testimonials data:', data.testimonials);

    if (!data.testimonials) {
      console.warn('No testimonials in response');
      return null;
    }

    try {
      const parsed = TestimonialsSchema.parse(data.testimonials);
      console.log('✅ Successfully parsed testimonials');
      return parsed;
    } catch (error) {
      console.error('❌ Zod validation error:', error);
      console.error('❌ Failed data:', JSON.stringify(data.testimonials, null, 2));
      throw error;
    }
  } catch (error) {
    console.error('❌ GraphQL fetch error:', error);
    throw error;
  }
}

/**
 * Fetch testimonials by title
 */
export async function getTestimonialsByTitle(
  title: string,
  preview = false
): Promise<Testimonials | null> {
  const query = `
    query GetTestimonialsByTitle($title: String!, $preview: Boolean!) {
      testimonialsCollection(where: { title: $title }, preview: $preview, limit: 1) {
        items {
          ${TESTIMONIALS_GRAPHQL_FIELDS}
        }
      }
    }
  `;

  const response = await fetchGraphQL(query, { title, preview });

  if (!response?.data) {
    return null;
  }

  const data = response.data as unknown as {
    testimonialsCollection?: { items?: Testimonials[] };
  };

  if (!data.testimonialsCollection?.items?.[0]) {
    return null;
  }

  return TestimonialsSchema.parse(data.testimonialsCollection.items[0]);
}

/**
 * Fetch a single testimonial item by ID
 */
export async function getTestimonialItemById(
  id: string,
  preview = false
): Promise<TestimonialItem | null> {
  const query = `
    query GetTestimonialItemById($id: String!, $preview: Boolean!) {
      testimonialItem(id: $id, preview: $preview) {
        ${TESTIMONIALITEM_GRAPHQL_FIELDS}
      }
    }
  `;

  const response = await fetchGraphQL(query, { id, preview });

  if (!response?.data) {
    return null;
  }

  const data = response.data as unknown as { testimonialItem?: TestimonialItem };

  if (!data.testimonialItem) {
    return null;
  }

  try {
    return data.testimonialItem;
  } catch (error) {
    console.error('Zod validation error:', error);
    console.error('Failed data:', JSON.stringify(data.testimonialItem, null, 2));
    throw error;
  }
}
