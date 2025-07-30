/**
 * Image API Module Tests
 *
 * This test suite verifies the functionality of the Image API module which handles
 * interactions with Contentful's GraphQL API for Image content type. It tests
 * the functions that retrieve Image content from Contentful and ensures they
 * handle error cases appropriately.
 *
 * Key aspects tested:
 * - Fetching all Images
 * - Fetching a single Image by ID
 * - Handling of GraphQL errors
 * - Handling of empty responses
 * - Proper parameter passing to the GraphQL API
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as imageAPI from '@/lib/contentful-api/image';
import { fetchGraphQL } from '@/lib/api';
import { ContentfulError, NetworkError } from '@/lib/errors';
import type { Image } from '@/types/contentful';

// Mock the fetchGraphQL function
vi.mock('@/lib/api', () => ({
  fetchGraphQL: vi.fn()
}));

// Sample test data
const mockImages = [
  {
    sys: { id: 'image1' },
    internalName: 'Test Image 1',
    link: 'https://example.com/images/test1.jpg',
    altText: 'Test image 1 description',
    __typename: 'Image'
  },
  {
    sys: { id: 'image2' },
    internalName: 'Test Image 2',
    link: 'https://example.com/images/test2.jpg',
    altText: 'Test image 2 description',
    __typename: 'Image'
  }
];

describe('Image API Module', () => {
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
   * Tests for getAllImages function
   *
   * Verifies that the function correctly fetches image content from Contentful,
   * and processes the response structure according to Contentful's GraphQL API conventions.
   */
  describe('getAllImages', () => {
    it('fetches images with correct query and parameters', async () => {
      // Mock successful response with images
      const mockImagesResponse = {
        data: {
          imageCollection: {
            items: mockImages
          }
        }
      };

      (fetchGraphQL as any).mockResolvedValue(mockImagesResponse);

      const result = await imageAPI.getAllImages();

      // Verify the result
      expect(result?.items).toHaveLength(2);
      expect(result?.items?.[0]?.internalName).toBe('Test Image 1');
      expect(result?.items?.[1]?.internalName).toBe('Test Image 2');

      // Verify fetchGraphQL was called with correct query and parameters
      expect(fetchGraphQL).toHaveBeenCalledWith(
        expect.stringContaining('imageCollection'),
        { preview: false },
        false
      );
    });

    it('uses preview token when preview is true', async () => {
      // Mock successful response with images
      const mockImagesResponse = {
        data: {
          imageCollection: {
            items: mockImages
          }
        }
      };

      (fetchGraphQL as any).mockResolvedValue(mockImagesResponse);

      await imageAPI.getAllImages(true);

      // Verify fetchGraphQL was called with preview parameter
      expect(fetchGraphQL).toHaveBeenCalledWith(expect.any(String), { preview: true }, true);
    });

    it('throws ContentfulError when response is invalid', async () => {
      // Mock invalid response
      (fetchGraphQL as any).mockResolvedValue({
        data: null
      });

      await expect(imageAPI.getAllImages()).rejects.toThrow(ContentfulError);
      await expect(imageAPI.getAllImages()).rejects.toThrow('Invalid response from Contentful');
    });

    it('throws ContentfulError when response data structure is invalid', async () => {
      // Mock response with invalid data structure
      (fetchGraphQL as any).mockResolvedValue({
        data: {
          imageCollection: {
            items: []
          }
        }
      });

      await expect(imageAPI.getAllImages()).rejects.toThrow(ContentfulError);
      await expect(imageAPI.getAllImages()).rejects.toThrow(
        'Failed to fetch Images from Contentful'
      );
    });

    it('passes through ContentfulError when thrown by fetchGraphQL', async () => {
      // Mock ContentfulError from fetchGraphQL
      const error = new ContentfulError('Test error from fetchGraphQL');
      (fetchGraphQL as any).mockRejectedValue(error);

      await expect(imageAPI.getAllImages()).rejects.toThrow(ContentfulError);
      await expect(imageAPI.getAllImages()).rejects.toThrow('Test error from fetchGraphQL');
    });

    it('wraps Error in NetworkError when thrown by fetchGraphQL', async () => {
      // Mock standard Error from fetchGraphQL
      const error = new Error('Network failure');
      (fetchGraphQL as any).mockRejectedValue(error);

      await expect(imageAPI.getAllImages()).rejects.toThrow(NetworkError);
      await expect(imageAPI.getAllImages()).rejects.toThrow(
        'Error fetching Images: Network failure'
      );
    });

    it('handles unknown errors', async () => {
      // Mock unknown error
      (fetchGraphQL as any).mockRejectedValue('Unknown error');

      await expect(imageAPI.getAllImages()).rejects.toThrow('Unknown error fetching Images');
    });
  });

  /**
   * Tests for getImageById function
   *
   * Ensures the function correctly fetches a single image by ID,
   * properly constructs the GraphQL query with the image ID parameter,
   * and handles cases where the image is not found.
   */
  describe('getImageById', () => {
    it('fetches a single image by ID', async () => {
      const imageId = 'image1';

      // Mock successful response with an image
      const mockImageResponse = {
        data: {
          image: mockImages[0]
        }
      };

      (fetchGraphQL as any).mockResolvedValue(mockImageResponse);

      const result = await imageAPI.getImageById(imageId);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.sys?.id).toBe(imageId);
      expect(result?.internalName).toBe('Test Image 1');
      expect(result?.link).toBe('https://example.com/images/test1.jpg');

      // Verify fetchGraphQL was called with correct query and variables
      expect(fetchGraphQL).toHaveBeenCalledWith(
        expect.stringContaining('GetImageById'),
        { id: imageId, preview: false },
        false
      );
    });

    it('returns null when image is not found', async () => {
      // Mock response with no image
      const mockEmptyResponse = {
        data: {
          image: null
        }
      };

      (fetchGraphQL as any).mockResolvedValue(mockEmptyResponse);

      const result = await imageAPI.getImageById('non-existent-id');

      expect(result).toBeNull();
    });

    it('uses preview token when preview is true', async () => {
      const imageId = 'image1';

      // Mock successful response
      const mockImageResponse = {
        data: {
          image: mockImages[0]
        }
      };

      (fetchGraphQL as any).mockResolvedValue(mockImageResponse);

      await imageAPI.getImageById(imageId, true);

      // Verify fetchGraphQL was called with preview parameter
      expect(fetchGraphQL).toHaveBeenCalledWith(
        expect.any(String),
        { id: imageId, preview: true },
        true
      );
    });

    it('throws ContentfulError when response is invalid', async () => {
      // Mock invalid response
      (fetchGraphQL as any).mockResolvedValue({
        data: null
      });

      await expect(imageAPI.getImageById('image1')).rejects.toThrow(ContentfulError);
      await expect(imageAPI.getImageById('image1')).rejects.toThrow(
        'Invalid response from Contentful'
      );
    });

    it('passes through ContentfulError when thrown by fetchGraphQL', async () => {
      // Mock ContentfulError from fetchGraphQL
      const error = new ContentfulError('Test error from fetchGraphQL');
      (fetchGraphQL as any).mockRejectedValue(error);

      await expect(imageAPI.getImageById('image1')).rejects.toThrow(ContentfulError);
      await expect(imageAPI.getImageById('image1')).rejects.toThrow('Test error from fetchGraphQL');
    });

    it('wraps Error in NetworkError when thrown by fetchGraphQL', async () => {
      // Mock standard Error from fetchGraphQL
      const error = new Error('Network failure');
      (fetchGraphQL as any).mockRejectedValue(error);

      await expect(imageAPI.getImageById('image1')).rejects.toThrow(NetworkError);
      await expect(imageAPI.getImageById('image1')).rejects.toThrow(
        'Error fetching Image: Network failure'
      );
    });

    it('handles unknown errors', async () => {
      // Mock unknown error
      (fetchGraphQL as any).mockRejectedValue('Unknown error');

      await expect(imageAPI.getImageById('image1')).rejects.toThrow('Unknown error fetching Image');
    });
  });
});
