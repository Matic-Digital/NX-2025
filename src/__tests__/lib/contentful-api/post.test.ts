/**
 * Post API Module Tests
 *
 * This test suite verifies the functionality of the Post API module which handles
 * interactions with Contentful's GraphQL API for Post content type. It tests
 * the functions that retrieve Post content from Contentful and ensures they
 * handle error cases appropriately.
 *
 * Key aspects tested:
 * - Fetching all Posts
 * - Fetching a single Post by ID
 * - Fetching a single Post by slug
 * - Fetching Posts by category
 * - Handling of GraphQL errors
 * - Handling of empty responses
 * - Proper parameter passing to the GraphQL API
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as postAPI from '@/lib/contentful-api/post';
import { fetchGraphQL } from '@/lib/api';
import { ContentfulError, NetworkError } from '@/lib/errors';
import type { Post } from '@/types/contentful/Post';

// Mock the fetchGraphQL function
vi.mock('@/lib/api', () => ({
  fetchGraphQL: vi.fn()
}));

// Sample test data
const mockPosts: Post[] = [
  {
    sys: { id: 'post1' },
    title: 'Test Post 1',
    slug: 'test-post-1',
    excerpt: 'This is a test post excerpt',
    datePublished: '2024-01-15',
    mainImage: {
      sys: { id: 'image1' },
      internalName: 'Test Image 1',
      link: 'https://example.com/images/test1.jpg',
      altText: 'Test image 1 description',
      __typename: 'Image'
    },
    content: {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          content: [
            {
              nodeType: 'text',
              value: 'This is test content'
            }
          ]
        }
      ]
    },
    authors: [
      {
        sys: { id: 'author1' },
        name: 'John Doe',
        title: 'Senior Developer',
        bio: 'Experienced developer',
        __typename: 'TeamMember'
      }
    ],
    categories: ['Blog', 'Featured'],
    tags: ['technology', 'development'],
    openGraphImage: {
      sys: { id: 'image2' },
      internalName: 'OG Image',
      link: 'https://example.com/images/og.jpg',
      altText: 'Open graph image',
      __typename: 'Image'
    },
    seoTitle: 'Test Post 1 - SEO Title',
    seoDescription: 'This is the SEO description for test post 1',
    seoFocusKeyword: 'test post',
    __typename: 'Post'
  },
  {
    sys: { id: 'post2' },
    title: 'Test Post 2',
    slug: 'test-post-2',
    excerpt: 'This is another test post excerpt',
    datePublished: '2024-01-10',
    content: {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          content: [
            {
              nodeType: 'text',
              value: 'This is more test content'
            }
          ]
        }
      ]
    },
    authors: [
      {
        sys: { id: 'author2' },
        name: 'Jane Smith',
        title: 'Content Writer',
        bio: 'Professional writer',
        __typename: 'TeamMember'
      }
    ],
    categories: ['Case Study'],
    tags: ['business', 'strategy'],
    seoTitle: 'Test Post 2 - SEO Title',
    seoDescription: 'This is the SEO description for test post 2',
    __typename: 'Post'
  }
];

describe('Post API Module', () => {
  /**
   * Set up mocks before each test
   */
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();
  });

  /**
   * Clean up mocks after each test
   */
  afterEach(() => {
    vi.resetAllMocks();
  });

  /**
   * Tests for getAllPosts function
   *
   * Verifies that the function correctly fetches post content from Contentful,
   * and processes the response structure according to Contentful's GraphQL API conventions.
   */
  describe('getAllPosts', () => {
    it('fetches posts with correct query and parameters', async () => {
      // Mock successful response with posts
      const mockPostsResponse = {
        data: {
          postCollection: {
            items: mockPosts
          }
        }
      };

      (fetchGraphQL as any).mockResolvedValue(mockPostsResponse);

      const result = await postAPI.getAllPosts();

      // Verify the result
      expect(result?.items).toHaveLength(2);
      expect(result?.items?.[0]?.title).toBe('Test Post 1');
      expect(result?.items?.[1]?.title).toBe('Test Post 2');

      // Verify fetchGraphQL was called with correct query and parameters
      expect(fetchGraphQL).toHaveBeenCalledWith(
        expect.stringContaining('postCollection'),
        { preview: false },
        false
      );

      // Verify the query includes ordering by datePublished_DESC
      expect(fetchGraphQL).toHaveBeenCalledWith(
        expect.stringContaining('order: datePublished_DESC'),
        { preview: false },
        false
      );
    });

    it('uses preview token when preview is true', async () => {
      // Mock successful response with posts
      const mockPostsResponse = {
        data: {
          postCollection: {
            items: mockPosts
          }
        }
      };

      (fetchGraphQL as any).mockResolvedValue(mockPostsResponse);

      await postAPI.getAllPosts(true);

      // Verify fetchGraphQL was called with preview parameter
      expect(fetchGraphQL).toHaveBeenCalledWith(expect.any(String), { preview: true }, true);
    });

    it('throws ContentfulError when response is invalid', async () => {
      // Mock invalid response
      (fetchGraphQL as any).mockResolvedValue({
        data: null
      });

      await expect(postAPI.getAllPosts()).rejects.toThrow(ContentfulError);
      await expect(postAPI.getAllPosts()).rejects.toThrow('Invalid response from Contentful');
    });

    it('throws ContentfulError when response data structure is invalid', async () => {
      // Mock response with invalid data structure
      (fetchGraphQL as any).mockResolvedValue({
        data: {
          postCollection: {
            items: []
          }
        }
      });

      await expect(postAPI.getAllPosts()).rejects.toThrow(ContentfulError);
      await expect(postAPI.getAllPosts()).rejects.toThrow('Failed to fetch Posts from Contentful');
    });

    it('passes through ContentfulError when thrown by fetchGraphQL', async () => {
      // Mock ContentfulError from fetchGraphQL
      const error = new ContentfulError('Test error from fetchGraphQL');
      (fetchGraphQL as any).mockRejectedValue(error);

      await expect(postAPI.getAllPosts()).rejects.toThrow(ContentfulError);
      await expect(postAPI.getAllPosts()).rejects.toThrow('Test error from fetchGraphQL');
    });

    it('wraps Error in NetworkError when thrown by fetchGraphQL', async () => {
      // Mock standard Error from fetchGraphQL
      const error = new Error('Network failure');
      (fetchGraphQL as any).mockRejectedValue(error);

      await expect(postAPI.getAllPosts()).rejects.toThrow(NetworkError);
      await expect(postAPI.getAllPosts()).rejects.toThrow('Error fetching Posts: Network failure');
    });

    it('handles unknown errors', async () => {
      // Mock unknown error
      (fetchGraphQL as any).mockRejectedValue('Unknown error');

      await expect(postAPI.getAllPosts()).rejects.toThrow('Unknown error fetching Posts');
    });
  });

  /**
   * Tests for getPostById function
   *
   * Ensures the function correctly fetches a single post by ID,
   * properly constructs the GraphQL query with the post ID parameter,
   * and handles cases where the post is not found.
   */
  describe('getPostById', () => {
    it('fetches a single post by ID', async () => {
      const postId = 'post1';

      // Mock successful response with a post
      const mockPostResponse = {
        data: {
          post: mockPosts[0]
        }
      };

      (fetchGraphQL as any).mockResolvedValue(mockPostResponse);

      const result = await postAPI.getPostById(postId);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.sys?.id).toBe(postId);
      expect(result?.title).toBe('Test Post 1');
      expect(result?.slug).toBe('test-post-1');

      // Verify fetchGraphQL was called with correct query and variables
      expect(fetchGraphQL).toHaveBeenCalledWith(
        expect.stringContaining('GetPostById'),
        { id: postId, preview: false },
        false
      );
    });

    it('returns null when post is not found', async () => {
      // Mock response with no post
      const mockEmptyResponse = {
        data: {
          post: null
        }
      };

      (fetchGraphQL as any).mockResolvedValue(mockEmptyResponse);

      const result = await postAPI.getPostById('non-existent-id');

      expect(result).toBeNull();
    });

    it('uses preview token when preview is true', async () => {
      const postId = 'post1';

      // Mock successful response
      const mockPostResponse = {
        data: {
          post: mockPosts[0]
        }
      };

      (fetchGraphQL as any).mockResolvedValue(mockPostResponse);

      await postAPI.getPostById(postId, true);

      // Verify fetchGraphQL was called with preview parameter
      expect(fetchGraphQL).toHaveBeenCalledWith(
        expect.any(String),
        { id: postId, preview: true },
        true
      );
    });

    it('throws ContentfulError when response is invalid', async () => {
      // Mock invalid response
      (fetchGraphQL as any).mockResolvedValue({
        data: null
      });

      await expect(postAPI.getPostById('post1')).rejects.toThrow(ContentfulError);
      await expect(postAPI.getPostById('post1')).rejects.toThrow(
        'Invalid response from Contentful'
      );
    });

    it('passes through ContentfulError when thrown by fetchGraphQL', async () => {
      // Mock ContentfulError from fetchGraphQL
      const error = new ContentfulError('Test error from fetchGraphQL');
      (fetchGraphQL as any).mockRejectedValue(error);

      await expect(postAPI.getPostById('post1')).rejects.toThrow(ContentfulError);
      await expect(postAPI.getPostById('post1')).rejects.toThrow('Test error from fetchGraphQL');
    });

    it('wraps Error in NetworkError when thrown by fetchGraphQL', async () => {
      // Mock standard Error from fetchGraphQL
      const error = new Error('Network failure');
      (fetchGraphQL as any).mockRejectedValue(error);

      await expect(postAPI.getPostById('post1')).rejects.toThrow(NetworkError);
      await expect(postAPI.getPostById('post1')).rejects.toThrow(
        'Error fetching Post: Network failure'
      );
    });

    it('handles unknown errors', async () => {
      // Mock unknown error
      (fetchGraphQL as any).mockRejectedValue('Unknown error');

      await expect(postAPI.getPostById('post1')).rejects.toThrow('Unknown error fetching Post');
    });
  });

  /**
   * Tests for getPostBySlug function
   *
   * Ensures the function correctly fetches a single post by slug,
   * properly constructs the GraphQL query with the post slug parameter,
   * and handles cases where the post is not found.
   */
  describe('getPostBySlug', () => {
    it('fetches a single post by slug', async () => {
      const postSlug = 'test-post-1';

      // Mock successful response with a post
      const mockPostResponse = {
        data: {
          postCollection: {
            items: [mockPosts[0]]
          }
        }
      };

      (fetchGraphQL as any).mockResolvedValue(mockPostResponse);

      const result = await postAPI.getPostBySlug(postSlug);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.slug).toBe(postSlug);
      expect(result?.title).toBe('Test Post 1');

      // Verify fetchGraphQL was called with correct query and variables
      expect(fetchGraphQL).toHaveBeenCalledWith(
        expect.stringContaining('GetPostBySlug'),
        { slug: postSlug, preview: false },
        false
      );

      // Verify the query includes slug filter
      expect(fetchGraphQL).toHaveBeenCalledWith(
        expect.stringContaining('where: { slug: $slug }'),
        { slug: postSlug, preview: false },
        false
      );
    });

    it('returns null when post is not found', async () => {
      // Mock response with no posts
      const mockEmptyResponse = {
        data: {
          postCollection: {
            items: []
          }
        }
      };

      (fetchGraphQL as any).mockResolvedValue(mockEmptyResponse);

      const result = await postAPI.getPostBySlug('non-existent-slug');

      expect(result).toBeNull();
    });

    it('uses preview token when preview is true', async () => {
      const postSlug = 'test-post-1';

      // Mock successful response
      const mockPostResponse = {
        data: {
          postCollection: {
            items: [mockPosts[0]]
          }
        }
      };

      (fetchGraphQL as any).mockResolvedValue(mockPostResponse);

      await postAPI.getPostBySlug(postSlug, true);

      // Verify fetchGraphQL was called with preview parameter
      expect(fetchGraphQL).toHaveBeenCalledWith(
        expect.any(String),
        { slug: postSlug, preview: true },
        true
      );
    });

    it('throws ContentfulError when response is invalid', async () => {
      // Mock invalid response
      (fetchGraphQL as any).mockResolvedValue({
        data: null
      });

      await expect(postAPI.getPostBySlug('test-slug')).rejects.toThrow(ContentfulError);
      await expect(postAPI.getPostBySlug('test-slug')).rejects.toThrow(
        'Invalid response from Contentful'
      );
    });

    it('passes through ContentfulError when thrown by fetchGraphQL', async () => {
      // Mock ContentfulError from fetchGraphQL
      const error = new ContentfulError('Test error from fetchGraphQL');
      (fetchGraphQL as any).mockRejectedValue(error);

      await expect(postAPI.getPostBySlug('test-slug')).rejects.toThrow(ContentfulError);
      await expect(postAPI.getPostBySlug('test-slug')).rejects.toThrow(
        'Test error from fetchGraphQL'
      );
    });

    it('wraps Error in NetworkError when thrown by fetchGraphQL', async () => {
      // Mock standard Error from fetchGraphQL
      const error = new Error('Network failure');
      (fetchGraphQL as any).mockRejectedValue(error);

      await expect(postAPI.getPostBySlug('test-slug')).rejects.toThrow(NetworkError);
      await expect(postAPI.getPostBySlug('test-slug')).rejects.toThrow(
        'Error fetching Post by slug: Network failure'
      );
    });

    it('handles unknown errors', async () => {
      // Mock unknown error
      (fetchGraphQL as any).mockRejectedValue('Unknown error');

      await expect(postAPI.getPostBySlug('test-slug')).rejects.toThrow(
        'Unknown error fetching Post by slug'
      );
    });
  });

  /**
   * Tests for getPostsByCategory function
   *
   * Ensures the function correctly fetches posts filtered by category,
   * properly constructs the GraphQL query with the category parameter,
   * and handles cases where no posts are found.
   */
  describe('getPostsByCategory', () => {
    it('fetches posts by category', async () => {
      const category = 'Blog';

      // Mock successful response with filtered posts
      const mockPostsResponse = {
        data: {
          postCollection: {
            items: [mockPosts[0]] // Only post with 'Blog' category
          }
        }
      };

      (fetchGraphQL as any).mockResolvedValue(mockPostsResponse);

      const result = await postAPI.getPostsByCategory(category);

      // Verify the result
      expect(result?.items).toHaveLength(1);
      expect(result?.items?.[0]?.categories).toContain('Blog');

      // Verify fetchGraphQL was called with correct query and variables
      expect(fetchGraphQL).toHaveBeenCalledWith(
        expect.stringContaining('GetPostsByCategory'),
        { category, preview: false },
        false
      );

      // Verify the query includes category filter
      expect(fetchGraphQL).toHaveBeenCalledWith(
        expect.stringContaining('categories_contains_some: [$category]'),
        { category, preview: false },
        false
      );
    });

    it('returns empty array when no posts found for category', async () => {
      // Mock response with no posts
      const mockEmptyResponse = {
        data: {
          postCollection: {
            items: []
          }
        }
      };

      (fetchGraphQL as any).mockResolvedValue(mockEmptyResponse);

      const result = await postAPI.getPostsByCategory('NonExistentCategory');

      expect(result?.items).toHaveLength(0);
    });

    it('uses preview token when preview is true', async () => {
      const category = 'Blog';

      // Mock successful response
      const mockPostsResponse = {
        data: {
          postCollection: {
            items: [mockPosts[0]]
          }
        }
      };

      (fetchGraphQL as any).mockResolvedValue(mockPostsResponse);

      await postAPI.getPostsByCategory(category, true);

      // Verify fetchGraphQL was called with preview parameter
      expect(fetchGraphQL).toHaveBeenCalledWith(
        expect.any(String),
        { category, preview: true },
        true
      );
    });

    it('throws ContentfulError when response is invalid', async () => {
      // Mock invalid response
      (fetchGraphQL as any).mockResolvedValue({
        data: null
      });

      await expect(postAPI.getPostsByCategory('Blog')).rejects.toThrow(ContentfulError);
      await expect(postAPI.getPostsByCategory('Blog')).rejects.toThrow(
        'Invalid response from Contentful'
      );
    });

    it('passes through ContentfulError when thrown by fetchGraphQL', async () => {
      // Mock ContentfulError from fetchGraphQL
      const error = new ContentfulError('Test error from fetchGraphQL');
      (fetchGraphQL as any).mockRejectedValue(error);

      await expect(postAPI.getPostsByCategory('Blog')).rejects.toThrow(ContentfulError);
      await expect(postAPI.getPostsByCategory('Blog')).rejects.toThrow(
        'Test error from fetchGraphQL'
      );
    });

    it('wraps Error in NetworkError when thrown by fetchGraphQL', async () => {
      // Mock standard Error from fetchGraphQL
      const error = new Error('Network failure');
      (fetchGraphQL as any).mockRejectedValue(error);

      await expect(postAPI.getPostsByCategory('Blog')).rejects.toThrow(NetworkError);
      await expect(postAPI.getPostsByCategory('Blog')).rejects.toThrow(
        'Error fetching Posts by category: Network failure'
      );
    });

    it('handles unknown errors', async () => {
      // Mock unknown error
      (fetchGraphQL as any).mockRejectedValue('Unknown error');

      await expect(postAPI.getPostsByCategory('Blog')).rejects.toThrow(
        'Unknown error fetching Posts by category'
      );
    });
  });
});
