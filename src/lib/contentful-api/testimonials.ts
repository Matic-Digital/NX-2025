import { fetchGraphQL } from '../api';
import { TestimonialsSchema, type Testimonials } from '@/types/contentful/Testimonials';
import { SYS_FIELDS } from './graphql-fields';
import { IMAGE_GRAPHQL_FIELDS } from './image';

// Use centralized GraphQL fields
export const TESTIMONIALS_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  itemsCollection {
    items {
      ${SYS_FIELDS}
      quote
      authorName
      authorTitle
      headshot {
        ${IMAGE_GRAPHQL_FIELDS}
      }
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

  // Debug: Log the actual response structure
  console.log(
    'Raw testimonialsCollection data:',
    JSON.stringify(data.testimonialsCollection.items, null, 2)
  );

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

  const response = await fetchGraphQL(query, { id, preview });

  if (!response?.data) {
    return null;
  }

  const data = response.data as unknown as { testimonials?: Testimonials };

  if (!data.testimonials) {
    return null;
  }

  // Debug: Log the actual response structure
  console.log('Raw testimonials data:', JSON.stringify(data.testimonials, null, 2));

  try {
    return TestimonialsSchema.parse(data.testimonials);
  } catch (error) {
    console.error('Zod validation error:', error);
    console.error('Failed data:', JSON.stringify(data.testimonials, null, 2));
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
