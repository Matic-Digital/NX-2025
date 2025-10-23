import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { IMAGE_GRAPHQL_FIELDS } from '@/components/Image/ImageApi';
import { TestimonialsSchema } from '@/components/Testimonials/TestimonialsSchema';

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

  return data.testimonialsCollection.items.filter(Boolean).map((item, _index) => {
    try {
      return TestimonialsSchema.parse(item);
    } catch (_error) {
      throw _error;
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
  try {
    const response = await fetchGraphQL(
      `query GetTestimonialsById($id: String!, $preview: Boolean!) {
        testimonials(id: $id, preview: $preview) {
          ${TESTIMONIALS_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { testimonials?: Testimonials };

    // Return null if testimonials not found
    if (!data.testimonials) {
      return null;
    }

    return data.testimonials;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Testimonials: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Testimonials');
  }
}

/**
 * Fetch testimonials by title
 */
export async function getTestimonialsByTitle(
  title: string,
  preview = false
): Promise<Testimonials | null> {
  try {
    const response = await fetchGraphQL(
      `query GetTestimonialsByTitle($title: String!, $preview: Boolean!) {
        testimonialsCollection(where: { title: $title }, preview: $preview, limit: 1) {
          items {
            ${TESTIMONIALS_GRAPHQL_FIELDS}
          }
        }
      }`,
      { title, preview },
      preview
    );

    // Check for valid response
    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to help TypeScript understand the structure
    const data = response.data as unknown as {
      testimonialsCollection?: { items?: Testimonials[] };
    };

    // Return null if testimonials not found
    if (!data.testimonialsCollection?.items?.[0]) {
      return null;
    }

    return data.testimonialsCollection.items[0];
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching Testimonials: ${_error.message}`);
    }
    throw new Error('Unknown error fetching Testimonials');
  }
}

/**
 * Fetch a single testimonial item by ID
 */
export async function getTestimonialItemById(
  id: string,
  preview = false
): Promise<TestimonialItem | null> {
  try {
    const response = await fetchGraphQL(
      `query GetTestimonialItemById($id: String!, $preview: Boolean!) {
        testimonialItem(id: $id, preview: $preview) {
          ${TESTIMONIALITEM_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { testimonialItem?: TestimonialItem };

    // Return null if testimonial item not found
    if (!data.testimonialItem) {
      return null;
    }

    return data.testimonialItem;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching TestimonialItem: ${_error.message}`);
    }
    throw new Error('Unknown error fetching TestimonialItem');
  }
}
