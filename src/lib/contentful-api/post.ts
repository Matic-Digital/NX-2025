import { fetchGraphQL } from '../api';

import type { Post, PostResponse } from '@/types/contentful/Post';
import { SYS_FIELDS } from './graphql-fields';
import { IMAGE_GRAPHQL_FIELDS } from './image';
import { ContentfulError, NetworkError } from '../errors';
import { TEAM_MEMBER_SIMPLE_GRAPHQL_FIELDS } from './team-member';

// Simplified Post fields for ContentGrid (to avoid complexity limits)
export const POST_GRAPHQL_FIELDS_SIMPLE = `
  ${SYS_FIELDS}
  title
  slug
  datePublished
  mainImage {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  categories
`;

export const POST_SLIDER_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  slug
  excerpt
  mainImage {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  categories
  content {
    json
  }
`;

// Full Post fields for individual Post queries
export const POST_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  slug
  excerpt
  datePublished
  mainImage {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  content {
    json
    links {
      entries {
        inline {
          sys {
            id
          }
          __typename
          ... on Image {
            title
            link
            altText
          }
        }
        block {
          sys {
            id
          }
          __typename
          ... on Image {
            title
            link
            altText
          }
        }
      }
    }
  }
  authorsCollection(limit: 5) {
    items {
      ${TEAM_MEMBER_SIMPLE_GRAPHQL_FIELDS}
    }
  }
  categories
  tags
  openGraphImage {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  seoTitle
  seoDescription
  seoFocusKeyword
`;

/**
 * Fetches all Posts from Contentful
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to Posts response with pagination info
 */
export async function getAllPosts(preview = false): Promise<PostResponse> {
  try {
    const response = await fetchGraphQL<Post>(
      `query GetAllPosts($preview: Boolean!) {
        postCollection(preview: $preview, order: datePublished_DESC) {
          items {
            ${POST_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { postCollection?: { items?: Post[] } };

    // Validate the data structure
    if (!data.postCollection?.items?.length) {
      throw new ContentfulError('Failed to fetch Posts from Contentful');
    }

    return {
      items: data.postCollection.items
    };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Posts: ${error.message}`);
    }
    throw new Error('Unknown error fetching Posts');
  }
}

/**
 * Fetches a single Post by ID from Contentful
 * @param id - The ID of the Post to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to Post or null if not found
 */
export async function getPostById(id: string, preview = false): Promise<Post | null> {
  try {
    const response = await fetchGraphQL<Post>(
      `query GetPostById($id: String!, $preview: Boolean!) {
        post(id: $id, preview: $preview) {
          ${POST_GRAPHQL_FIELDS}
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
    const data = response.data as unknown as { post?: Post };

    // Return null if post not found
    if (!data.post) {
      return null;
    }

    return data.post;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Post: ${error.message}`);
    }
    throw new Error('Unknown error fetching Post');
  }
}

/**
 * Fetches a single Post by slug from Contentful
 * @param slug - The slug of the Post to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to Post or null if not found
 */
export async function getPostBySlug(slug: string, preview = false): Promise<Post | null> {
  try {
    const response = await fetchGraphQL<Post>(
      `query GetPostBySlug($slug: String!, $preview: Boolean!) {
        postCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
          items {
            ${POST_GRAPHQL_FIELDS}
          }
        }
      }`,
      { slug, preview },
      preview
    );

    // Check for valid response
    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to help TypeScript understand the structure
    const data = response.data as unknown as { postCollection?: { items?: Post[] } };

    // Return null if post not found
    if (!data.postCollection?.items?.length) {
      return null;
    }

    const post = data.postCollection.items[0];
    if (!post) {
      return null;
    }

    return post;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Post by slug: ${error.message}`);
    }
    throw new Error('Unknown error fetching Post by slug');
  }
}

/**
 * Fetches all Posts with minimal fields (for Collection display)
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to Posts response with minimal data
 */
export async function getAllPostsMinimal(preview = false): Promise<PostResponse> {
  try {
    const response = await fetchGraphQL<Post>(
      `query GetAllPostsMinimal($preview: Boolean!) {
        postCollection(preview: $preview, order: datePublished_DESC) {
          items {
            ${SYS_FIELDS}
            title
            slug
            mainImage {
              link
              altText
            }
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
    const data = response.data as unknown as { postCollection?: { items?: Post[] } };

    // Return empty array if no posts found
    if (!data.postCollection?.items) {
      return { items: [] };
    }

    return {
      items: data.postCollection.items
    };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Posts minimal: ${error.message}`);
    }
    throw new Error('Unknown error fetching Posts minimal');
  }
}

/**
 * Fetches Posts by category from Contentful
 * @param category - The category to filter by
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to Posts response with pagination info
 */
export async function getPostsByCategory(category: string, preview = false): Promise<PostResponse> {
  try {
    const response = await fetchGraphQL<Post>(
      `query GetPostsByCategory($category: String!, $preview: Boolean!) {
        postCollection(where: { categories_contains_some: [$category] }, preview: $preview, order: datePublished_DESC) {
          items {
            ${POST_GRAPHQL_FIELDS}
          }
        }
      }`,
      { category, preview },
      preview
    );

    // Check for valid response
    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to help TypeScript understand the structure
    const data = response.data as unknown as { postCollection?: { items?: Post[] } };

    // Return empty array if no posts found
    if (!data.postCollection?.items) {
      return { items: [] };
    }

    return {
      items: data.postCollection.items
    };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching Posts by category: ${error.message}`);
    }
    throw new Error('Unknown error fetching Posts by category');
  }
}
