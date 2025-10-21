// draftMode import removed as it's not used in this file
import { getCurrentLocale } from '@/lib/contentful-locale';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';
import { fetchGraphQL } from '@/lib/api';

import { IMAGE_GRAPHQL_FIELDS } from '@/components/Image/ImageApi';
import { TEAM_MEMBER_SIMPLE_GRAPHQL_FIELDS } from '@/components/TeamMember/TeamMemberApi';
import { HUBSPOTFORM_GRAPHQL_FIELDS } from '@/components/Forms/HubspotForm/HubspotFormApi';
import { TESTIMONIALITEM_GRAPHQL_FIELDS } from '@/components/Testimonials/TestimonialsApi';

import type { Post, PostResponse } from '@/components/Post/PostSchema';

// Interface for GraphQL response structure
interface GraphQLPostResponse {
  data?: {
    post?: Post;
    postCollection?: {
      items: Post[];
      total: number;
    };
  };
}

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
  template
  excerpt
  datePublished
  mainImage {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  bannerBackground {
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
  authorsCollection {
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
  pageLayout {
    sys {
      id
    }
    title
    header {
      sys {
        id
      }
    }
    footer {
      sys {
        id
      }
    }
  }
  gatedContentForm {
    ${HUBSPOTFORM_GRAPHQL_FIELDS}
  }
  testimonial {
    ${TESTIMONIALITEM_GRAPHQL_FIELDS}
  }
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
            ${SYS_FIELDS}
            title
            slug
            categories
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
 * Fetches a single Post by ID from Contentful with locale support
 * @param id - The ID of the Post to fetch
 * @param preview - Whether to fetch draft content
 * @param targetLocale - Optional specific locale to fetch (auto-detects if not provided)
 * @returns Promise resolving to Post or null if not found
 */
export async function getPostById(id: string, preview = false, targetLocale?: string): Promise<Post | null> {
  try {
    const locale = targetLocale ?? getCurrentLocale();
    
    const response = await fetchGraphQL<Post>(
      `query GetPostById($id: String!, $preview: Boolean!, $locale: String) {
        post(id: $id, preview: $preview, locale: $locale) {
          ${POST_GRAPHQL_FIELDS}
        }
      }`,
      { id, preview, locale },
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
 * Fetches a single Post by slug from Contentful with automatic locale detection and fallback
 * @param slug - The slug of the Post to fetch
 * @param preview - Whether to fetch draft content
 * @param targetLocale - Optional specific locale to fetch (auto-detects if not provided)
 * @returns Promise resolving to Post or null if not found
 */
export async function getPostBySlug(slug: string, preview = false, targetLocale?: string): Promise<Post | null> {
  try {
    const testLocale = targetLocale ?? getCurrentLocale();
    
    // First, try to find the post in the target locale
    let response = await fetchGraphQL(
      `query GetPostBySlug($slug: String!, $preview: Boolean!, $locale: String) {
        postCollection(where: { slug: $slug }, limit: 1, preview: $preview, locale: $locale) {
          items {
            ${POST_GRAPHQL_FIELDS}
          }
        }
      }`,
      { slug, preview, locale: testLocale },
      preview
    );

    // Check if we found the post in the target locale
    if (response?.data?.postCollection?.items && response.data.postCollection.items.length > 0) {
      // Found in target locale
    } else {
      // Post not found in target locale, search in all locales
      
      // If not found in target locale, search across all locales to find the post
      const allLocales = ['en-US', 'pt-BR', 'es'];
      let foundEntry = null;
      let foundInLocale = null;

      for (const locale of allLocales) {
        if (locale === testLocale) continue; // Already tried this one
        const localeResponse = await fetchGraphQL(
          `query GetPostBySlug($slug: String!, $preview: Boolean!, $locale: String) {
            postCollection(where: { slug: $slug }, limit: 1, preview: $preview, locale: $locale) {
              items {
                ${POST_GRAPHQL_FIELDS}
              }
            }
          }`,
          { slug, preview, locale },
          preview
        );

        if (localeResponse?.data?.postCollection?.items && localeResponse.data.postCollection.items.length > 0) {
          foundEntry = localeResponse.data.postCollection.items[0] as Post;
          foundInLocale = locale;
          break;
        }
      }

      if (foundEntry && foundInLocale) {
        // Now get the same post in the target locale using the entry ID
        
        const targetLocaleResponse = await fetchGraphQL(
          `query GetPostById($id: String!, $preview: Boolean!, $locale: String) {
            post(id: $id, preview: $preview, locale: $locale) {
              ${POST_GRAPHQL_FIELDS}
            }
          }`,
          { id: foundEntry.sys.id, preview, locale: testLocale },
          preview
        );

        const targetData = targetLocaleResponse as GraphQLPostResponse;
        if (targetData?.data?.post) {
          response = {
            data: {
              postCollection: {
                items: [targetData.data.post],
                total: 1
              }
            }
          };
          // Successfully retrieved post in target locale
        } else {
          // Could not get post in target locale, using original locale
          response = {
            data: {
              postCollection: {
                items: [foundEntry],
                total: 1
              }
            }
          };
        }
      } else {
        return null;
      }
    }

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

    // Post content validation
    if (!post.title || !post.slug) {
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
 * @param targetLocale - Optional specific locale to fetch (auto-detects if not provided)
 * @returns Promise resolving to Posts response with minimal data
 */
export async function getAllPostsMinimal(preview = false, targetLocale?: string): Promise<PostResponse> {
  try {
    const _locale = targetLocale ?? getCurrentLocale();
    
    const response = await fetchGraphQL<Post>(
      `query GetAllPostsMinimal($preview: Boolean!, $locale: String) {
        postCollection(preview: $preview, order: datePublished_DESC, locale: $locale) {
          items {
            ${SYS_FIELDS}
            title
            slug
            datePublished
            categories
            mainImage {
              link
              altText
            }
            contentfulMetadata {
              tags {
                id
                name
              }
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

// MegaMenu-specific Post fields (minimal fields needed for MegaMenuCard)
export const POST_MEGAMENU_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  slug
  excerpt
  mainImage {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  categories
`;

/**
 * Fetches related Posts based on shared categories
 * @param categories - Array of categories to match
 * @param excludeId - ID of current post to exclude from results
 * @param limit - Number of posts to fetch (default 3)
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to Posts response with related posts
 */
export async function getRelatedPosts(
  categories: string[], 
  excludeId: string, 
  limit = 3, 
  preview = false
): Promise<PostResponse> {
  try {
    const response = await fetchGraphQL<Post>(
      `query GetRelatedPosts($categories: [String!]!, $excludeId: String!, $limit: Int!, $preview: Boolean!) {
        postCollection(
          where: { 
            categories_contains_some: $categories,
            sys: { id_not: $excludeId }
          }, 
          preview: $preview, 
          order: datePublished_DESC, 
          limit: $limit
        ) {
          items {
            ${POST_GRAPHQL_FIELDS_SIMPLE}
          }
        }
      }`,
      { categories, excludeId, limit, preview },
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
      throw new NetworkError(`Error fetching related Posts: ${error.message}`);
    }
    throw new Error('Unknown error fetching related Posts');
  }
}

/**
 * Fetches recent Posts for MegaMenu display with minimal data
 * @param limit - Maximum number of posts to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to Posts response with minimal data for MegaMenu
 */
export async function getRecentPostsForMegaMenu(limit = 3, preview = false): Promise<PostResponse> {
  try {
    const response = await fetchGraphQL<Post>(
      `query GetRecentPostsForMegaMenu($limit: Int!, $preview: Boolean!) {
        postCollection(preview: $preview, order: datePublished_DESC, limit: $limit) {
          items {
            ${POST_MEGAMENU_GRAPHQL_FIELDS}
          }
        }
      }`,
      { limit, preview },
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

    return { items: data.postCollection.items };
  } catch (error) {
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching recent posts for mega menu: ${error.message}`);
    }
    throw new Error('Unknown error fetching recent posts for mega menu');
  }
}

/**
 * Fetches recent Posts for MegaMenu display filtered by category
 * @param category - Category to filter posts by (extracted from Contentful tag like "Post:Case Study")
 * @param limit - Maximum number of posts to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to Posts response with minimal data for MegaMenu
 */
export async function getRecentPostsForMegaMenuByCategory(category: string, limit = 3, preview = false): Promise<PostResponse> {
  try {
    const response = await fetchGraphQL<Post>(
      `query GetRecentPostsForMegaMenuByCategory($category: String!, $limit: Int!, $preview: Boolean!) {
        postCollection(
          preview: $preview, 
          order: datePublished_DESC, 
          limit: $limit,
          where: { categories_contains_some: [$category] }
        ) {
          items {
            ${POST_MEGAMENU_GRAPHQL_FIELDS}
          }
        }
      }`,
      { category, limit, preview },
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

    return { items: data.postCollection.items };
  } catch (error) {
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching recent posts for mega menu by category: ${error.message}`);
    }
    throw new Error('Unknown error fetching recent posts for mega menu by category');
  }
}
