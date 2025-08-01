/**
 * API Module Tests
 *
 * This test suite verifies the functionality of the API module which handles
 * interactions with Contentful's GraphQL API. It tests various data fetching
 * functions to ensure they correctly retrieve content from Contentful and
 * handle error cases appropriately.
 *
 * Key aspects tested:
 * - Fetching various content types (BannerHeroes, Pages, NavBars, PageLists)
 * - Handling of GraphQL errors
 * - Handling of empty responses
 * - Proper parameter passing to the GraphQL API
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as api from '@/lib/api';
import { ContentfulError, NetworkError, GraphQLError } from '@/lib/errors';

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_CONTENTFUL_SPACE_ID', 'mock-space-id');
vi.stubEnv('NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN', 'mock-access-token');
vi.stubEnv('NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN', 'mock-preview-token');

// Mock global fetch
const originalFetch = global.fetch;

describe('API Module', () => {
  /**
   * Set up mocks before each test
   *
   * This includes resetting all mocks and setting up the global fetch mock.
   */
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();

    // Mock fetch
    global.fetch = vi.fn();
  });

  /**
   * Clean up mocks after each test
   *
   * Restore the original fetch function and clear environment variable stubs.
   */
  afterEach(() => {
    // Restore original fetch after each test
    global.fetch = originalFetch;

    // Clear environment variable stubs
    vi.unstubAllEnvs();
  });

  /**
   * Tests for fetchGraphQL function
   *
   * This function is the core of the API module, responsible for making
   * GraphQL requests to Contentful and handling various response scenarios.
   */
  describe('fetchGraphQL', () => {
    it('makes a request to the correct Contentful endpoint with proper headers', async () => {
      // Mock successful response
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: { test: 'data' } })
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const query = '{ test { field } }';
      const variables = { id: '123' };

      await api.fetchGraphQL(query, variables);

      // Verify fetch was called with correct arguments
      expect(global.fetch).toHaveBeenCalledWith(
        'https://graphql.contentful.com/content/v1/spaces/mock-space-id',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-access-token'
          },
          body: JSON.stringify({ query, variables }),
          cache: 'force-cache'
        }
      );
    });

    it('uses preview token when preview is true', async () => {
      // Mock successful response
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: { test: 'data' } })
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const query = '{ test { field } }';
      await api.fetchGraphQL(query, {}, true);

      // Verify preview token was used
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-preview-token'
          })
        })
      );
    });

    it('includes cache configuration when provided', async () => {
      // Mock successful response
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: { test: 'data' } })
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const query = '{ test { field } }';
      const cacheConfig = { next: { revalidate: 60 } };

      await api.fetchGraphQL(query, {}, false, cacheConfig);

      // Verify cache config was included
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          next: cacheConfig.next
        })
      );
    });

    it('returns data when request is successful', async () => {
      const expectedData = { data: { test: 'successful data' } };

      // Mock successful response
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(expectedData)
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await api.fetchGraphQL('{ test }');

      expect(result).toEqual(expectedData);
    });

    it('throws NetworkError when response is not ok', async () => {
      // Mock failed response
      const mockResponse = {
        ok: false,
        statusText: 'Not Found',
        clone: vi.fn().mockReturnValue({
          text: vi.fn().mockResolvedValue('Error body')
        })
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      await expect(api.fetchGraphQL('{ test }')).rejects.toThrow(NetworkError);
      await expect(api.fetchGraphQL('{ test }')).rejects.toThrow('Network error: Not Found');
    });

    it('throws GraphQLError when response contains GraphQL errors', async () => {
      const graphqlErrors = [{ message: 'Invalid field' }];

      // Mock response with GraphQL errors
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          errors: graphqlErrors
        })
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      await expect(api.fetchGraphQL('{ test }')).rejects.toThrow(GraphQLError);
      await expect(api.fetchGraphQL('{ test }')).rejects.toThrow('GraphQL query execution error');
    });

    it('throws ContentfulError for other errors', async () => {
      // Mock fetch implementation that throws
      (global.fetch as any).mockRejectedValue(new Error('Random error'));

      await expect(api.fetchGraphQL('{ test }')).rejects.toThrow(ContentfulError);
      await expect(api.fetchGraphQL('{ test }')).rejects.toThrow(
        'Failed to fetch data from Contentful'
      );
    });
  });

  /**
   * Tests for getAllBannerHeroes function
   *
   * Verifies that the function correctly fetches banner hero content from Contentful,
   * handles pagination parameters, and processes the response structure according
   * to Contentful's GraphQL API conventions.
   */
  describe('getAllBannerHeroes', () => {
    it('fetches banner heroes with correct query and parameters', async () => {
      // Mock successful response with banner heroes
      const mockBannerHeroesResponse = {
        data: {
          bannerHeroCollection: {
            items: [
              {
                sys: { id: 'banner-hero1' },
                name: 'Banner Hero 1',
                __typename: 'BannerHero'
              }
            ],
            total: 2
          }
        }
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockBannerHeroesResponse)
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await api.getAllBannerHeroes(false, 10, 0);

      // Verify the result
      expect(result?.items).toHaveLength(2);
      expect(result?.items?.[0]?.name).toBe('Banner Hero 1');
      expect(result?.items?.[1]?.name).toBe('Banner Hero 2');
      expect(result?.total).toBe(2);

      // Verify fetch was called with correct query
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('bannerHeroCollection')
        })
      );
    });

    it('handles empty banner hero collection', async () => {
      // Mock empty response
      const mockEmptyResponse = {
        data: {
          bannerHeroCollection: {
            items: [],
            total: 0
          }
        }
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockEmptyResponse)
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await api.getAllBannerHeroes();

      expect(result?.items).toHaveLength(0);
      expect(result?.total).toBe(0);
    });
  });

  /**
   * Tests for getBannerHero function
   *
   * Ensures the function correctly fetches a single banner hero by ID,
   * properly constructs the GraphQL query with the banner hero ID parameter,
   * and handles cases where the banner hero is not found.
   */
  describe('getBannerHero', () => {
    it('fetches a single banner hero by ID', async () => {
      const bannerHeroId = 'banner-hero123';

      // Mock successful response with a banner hero
      const mockBannerHeroResponse = {
        data: {
          bannerHeroCollection: {
            items: [
              {
                sys: { id: bannerHeroId },
                name: 'Test Banner Hero',
                description: 'Test Description',
                __typename: 'BannerHero'
              }
            ]
          }
        }
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockBannerHeroResponse)
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await api.getBannerHero(bannerHeroId);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.sys?.id).toBe(bannerHeroId);
      expect(result?.name).toBe('Test Banner Hero');

      // Verify fetch was called with correct query and variables
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining(bannerHeroId)
        })
      );
    });

    it('returns null when banner hero is not found', async () => {
      // Mock response with no banner hero
      const mockEmptyResponse = {
        data: {
          bannerHeroCollection: {
            items: []
          }
        }
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockEmptyResponse)
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await api.getBannerHero('non-existent-id');

      expect(result).toBeNull();
    });
  });

  /**
   * Tests for getPageBySlug function
   *
   * Verifies that the function correctly retrieves a page by its slug,
   * handles the nested content structure of pages in Contentful,
   * and returns null when a page is not found.
   */
  describe('getPageBySlug', () => {
    it('fetches a page by slug', async () => {
      const slug = 'test-page';

      // Mock successful response with a page
      const mockPageResponse = {
        data: {
          pageCollection: {
            items: [
              {
                sys: { id: 'page1' },
                name: 'Test Page',
                slug: slug,
                description: 'Test Description',
                pageContentCollection: {
                  items: [
                    {
                      sys: { id: 'banner-hero1' },
                      name: 'Banner Hero Component',
                      description: 'Banner Hero Description',
                      __typename: 'BannerHero'
                    }
                  ]
                },
                __typename: 'Page'
              }
            ]
          }
        }
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockPageResponse)
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await api.getPageBySlug(slug);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.slug).toBe(slug);
      expect(result?.name).toBe('Test Page');
      expect(result?.pageContentCollection?.items).toHaveLength(1);
      expect(result?.pageContentCollection?.items?.[0]?.name).toBe('Banner Hero Component');

      // Verify fetch was called with correct query and variables
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining(slug)
        })
      );
    });

    it('returns null when page is not found', async () => {
      // Mock response with no page
      const mockEmptyResponse = {
        data: {
          pageCollection: {
            items: []
          }
        }
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockEmptyResponse)
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await api.getPageBySlug('non-existent-slug');

      expect(result).toBeNull();
    });
  });

  /**
   * Tests for getHeaderByName function
   *
   * Tests the retrieval of navigation bars by name, ensuring proper
   * handling of the complex structure of NavBar content type which includes
   * references to other content types like Page and PageList.
   */
  describe('getHeaderByName', () => {
    it('fetches a header by name', async () => {
      const headerName = 'Main Navigation';

      // Mock successful response with a header
      const mockNavBarResponse = {
        data: {
          headerCollection: {
            items: [
              {
                sys: { id: 'header1' },
                name: headerName,
                logo: {
                  sys: { id: 'logo1' },
                  title: 'Logo',
                  description: 'Site Logo',
                  url: 'https://example.com/logo.png',
                  width: 200,
                  height: 100
                },
                navLinksCollection: {
                  items: [
                    {
                      sys: { id: 'page1' },
                      name: 'Home',
                      slug: 'home',
                      __typename: 'Page'
                    },
                    {
                      sys: { id: 'pagelist1' },
                      name: 'Products',
                      slug: 'products',
                      __typename: 'PageList'
                    }
                  ]
                },
                __typename: 'Header'
              }
            ]
          }
        }
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockNavBarResponse)
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await api.getHeaderByName(headerName);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.name).toBe(headerName);
      expect(result?.logo?.title).toBe('Logo');
      expect(result?.navLinksCollection?.items).toHaveLength(2);
      expect(result?.navLinksCollection?.items?.[0]?.name).toBe('Home');
      expect(result?.navLinksCollection?.items?.[1]?.name).toBe('Products');

      // Verify fetch was called with correct query and variables
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining(headerName)
        })
      );
    });

    it('returns null when header is not found', async () => {
      // Mock response with no header
      const mockEmptyResponse = {
        data: {
          headerCollection: {
            items: []
          }
        }
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockEmptyResponse)
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await api.getHeaderByName('non-existent-header');

      expect(result).toBeNull();
    });
  });

  /**
   * Tests for getAllHeaders function
   *
   * Verifies that the function correctly fetches all navigation bars,
   * processes the collection structure, and handles empty results
   * and GraphQL errors appropriately.
   */
  describe('getAllHeaders', () => {
    it('fetches all headers with correct query', async () => {
      // Mock successful response with headers
      const mockNavBarsResponse = {
        data: {
          headerCollection: {
            items: [
              {
                sys: { id: 'header1' },
                name: 'Main Navigation',
                logo: {
                  url: 'https://example.com/logo1.png',
                  title: 'Logo 1',
                  width: 200,
                  height: 100
                },
                navLinksCollection: {
                  items: [
                    {
                      sys: { id: 'page1' },
                      name: 'Home',
                      slug: 'home',
                      __typename: 'Page'
                    }
                  ]
                },
                __typename: 'Header'
              },
              {
                sys: { id: 'header2' },
                name: 'Footer Navigation',
                logo: {
                  url: 'https://example.com/logo2.png',
                  title: 'Logo 2',
                  width: 150,
                  height: 75
                },
                navLinksCollection: {
                  items: [
                    {
                      sys: { id: 'page2' },
                      name: 'About',
                      slug: 'about',
                      __typename: 'Page'
                    }
                  ]
                },
                __typename: 'Header'
              }
            ],
            total: 2
          }
        }
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockNavBarsResponse)
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await api.getAllHeaders();

      // Verify the result
      expect(result?.items).toHaveLength(2);
      expect(result?.items?.[0]?.name).toBe('Main Navigation');
      expect(result?.items?.[1]?.name).toBe('Footer Navigation');
      expect(result?.total).toBe(2);

      // Verify fetch was called with correct query
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('headerCollection')
        })
      );
    });

    it('handles empty header collection', async () => {
      // Mock empty response
      const mockEmptyResponse = {
        data: {
          headerCollection: {
            items: [],
            total: 0
          }
        }
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockEmptyResponse)
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await api.getAllHeaders();

      expect(result?.items).toHaveLength(0);
      expect(result?.total).toBe(0);
    });

    it('handles GraphQL errors', async () => {
      // Mock response with GraphQL errors
      const mockErrorResponse = {
        errors: [{ message: 'Failed to fetch headers' }]
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockErrorResponse)
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      await expect(api.getAllHeaders()).rejects.toThrow(GraphQLError);
      await expect(api.getAllHeaders()).rejects.toThrow('GraphQL query execution error');
    });
  });

  /**
   * Tests for getHeaderById function
   *
   * Ensures the function correctly fetches a NavBar by its system ID,
   * handles the complex structure with nested collections and references,
   * and properly returns null when the NavBar is not found.
   */
  describe('getHeaderById', () => {
    it('fetches a header by ID', async () => {
      const headerId = 'header123';

      // Mock successful response with a header
      const mockNavBarResponse = {
        data: {
          headerCollection: {
            items: [
              {
                sys: { id: headerId },
                name: 'Test NavBar',
                logo: {
                  url: 'https://example.com/logo.png',
                  title: 'Logo',
                  width: 200,
                  height: 100
                },
                navLinksCollection: {
                  items: [
                    {
                      sys: { id: 'page1' },
                      name: 'Home',
                      slug: 'home',
                      __typename: 'Page'
                    },
                    {
                      sys: { id: 'pagelist1' },
                      name: 'Products',
                      slug: 'products',
                      pagesCollection: {
                        items: [
                          {
                            sys: { id: 'subpage1' },
                            name: 'Product 1',
                            slug: 'product-1',
                            __typename: 'Page'
                          }
                        ]
                      },
                      __typename: 'PageList'
                    }
                  ]
                },
                __typename: 'Header'
              }
            ]
          }
        }
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockNavBarResponse)
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await api.getHeaderById(headerId);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.sys?.id).toBe(headerId);
      expect(result?.name).toBe('Test NavBar');
      expect(result?.navLinksCollection?.items).toHaveLength(2);
      expect((result?.navLinksCollection?.items?.[0] as any)?.__typename).toBe('Page');
      expect((result?.navLinksCollection?.items?.[1] as any)?.__typename).toBe('PageList');

      // Verify fetch was called with correct query and variables
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining(headerId)
        })
      );
    });

    it('returns null when header is not found', async () => {
      // Mock response with no header
      const mockEmptyResponse = {
        data: {
          headerCollection: {
            items: []
          }
        }
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockEmptyResponse)
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await api.getHeaderById('non-existent-id');

      expect(result).toBeNull();
    });

    it('handles GraphQL errors', async () => {
      // Mock response with GraphQL errors
      const mockErrorResponse = {
        errors: [{ message: 'Failed to fetch header by ID' }]
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockErrorResponse)
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      await expect(api.getHeaderById('test-id')).rejects.toThrow(GraphQLError);
      await expect(api.getHeaderById('test-id')).rejects.toThrow('GraphQL query execution error');
    });
  });

  /**
   * Tests for getAllPages function
   *
   * Verifies that the function correctly fetches pages with pagination,
   * processes the collection structure, and handles empty results.
   */
  describe('getAllPages', () => {
    it('fetches pages with correct query and parameters', async () => {
      // Mock successful response with pages
      const mockPagesResponse = {
        data: {
          pageCollection: {
            items: [
              {
                sys: { id: 'page1' },
                name: 'Page 1',
                slug: 'page-1',
                description: 'Description 1',
                pageContentCollection: {
                  items: []
                },
                __typename: 'Page'
              },
              {
                sys: { id: 'page2' },
                name: 'Page 2',
                slug: 'page-2',
                description: 'Description 2',
                pageContentCollection: {
                  items: []
                },
                __typename: 'Page'
              }
            ],
            total: 2
          }
        }
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockPagesResponse)
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await api.getAllPages(false, 0, 10);

      // Verify the result
      expect(result?.items).toHaveLength(2);
      expect(result?.items?.[0]?.name).toBe('Page 1');
      expect(result?.items?.[1]?.name).toBe('Page 2');
      expect(result?.total).toBe(2);

      // Verify fetch was called with correct query
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('pageCollection')
        })
      );
    });

    it('handles empty page collection', async () => {
      // Mock empty response
      const mockEmptyResponse = {
        data: {
          pageCollection: {
            items: [],
            total: 0
          }
        }
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockEmptyResponse)
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await api.getAllPages();

      expect(result?.items).toHaveLength(0);
      expect(result?.total).toBe(0);
    });
  });

  /**
   * Tests for getAllPageLists function
   *
   * Tests the retrieval of all page lists, ensuring proper handling of
   * the collection structure and empty results.
   */
  describe('getAllPageLists', () => {
    it('fetches page lists with correct query', async () => {
      // Mock successful response with page lists
      const mockPageListsResponse = {
        data: {
          pageListCollection: {
            items: [
              {
                sys: { id: 'pagelist1' },
                name: 'Products',
                slug: 'products',
                pagesCollection: {
                  items: [
                    {
                      sys: { id: 'page1' },
                      name: 'Product 1',
                      slug: 'product-1',
                      __typename: 'Page'
                    }
                  ]
                },
                __typename: 'PageList'
              },
              {
                sys: { id: 'pagelist2' },
                name: 'Services',
                slug: 'services',
                pagesCollection: {
                  items: [
                    {
                      sys: { id: 'page2' },
                      name: 'Service 1',
                      slug: 'service-1',
                      __typename: 'Page'
                    }
                  ]
                },
                __typename: 'PageList'
              }
            ],
            total: 2
          }
        }
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockPageListsResponse)
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await api.getAllPageLists();

      // Verify the result
      expect(result?.items).toHaveLength(2);
      expect(result?.items?.[0]?.name).toBe('Products');
      expect(result?.items?.[1]?.name).toBe('Services');
      expect(result?.total).toBe(2);

      // Verify fetch was called with correct query
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('pageListCollection')
        })
      );
    });

    it('handles empty page list collection', async () => {
      // Mock empty response
      const mockEmptyResponse = {
        data: {
          pageListCollection: {
            items: [],
            total: 0
          }
        }
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockEmptyResponse)
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await api.getAllPageLists();

      expect(result?.items).toHaveLength(0);
      expect(result?.total).toBe(0);
    });
  });

  /**
   * Tests for getPageListBySlug function
   *
   * Verifies that the function correctly retrieves a page list by its slug,
   * handles the nested structure with references to pages, and returns null
   * when a page list is not found.
   */
  describe('getPageListBySlug', () => {
    it('fetches a page list by slug', async () => {
      const slug = 'test-pagelist';

      // Mock successful response with a page list
      const mockPageListResponse = {
        data: {
          pageListCollection: {
            items: [
              {
                sys: { id: 'pagelist1' },
                name: 'Test PageList',
                slug: slug,
                pagesCollection: {
                  items: [
                    {
                      sys: { id: 'page1' },
                      name: 'Page 1',
                      slug: 'page-1',
                      __typename: 'Page'
                    },
                    {
                      sys: { id: 'page2' },
                      name: 'Page 2',
                      slug: 'page-2',
                      __typename: 'Page'
                    }
                  ]
                },
                __typename: 'PageList'
              }
            ]
          }
        }
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockPageListResponse)
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await api.getPageListBySlug(slug);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.slug).toBe(slug);
      expect(result?.name).toBe('Test PageList');
      expect(result?.pagesCollection?.items).toHaveLength(2);
      expect(result?.pagesCollection?.items?.[0]?.name).toBe('Page 1');
      expect(result?.pagesCollection?.items?.[1]?.name).toBe('Page 2');

      // Verify fetch was called with correct query and variables
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining(slug)
        })
      );
    });

    it('returns null when page list is not found', async () => {
      // Mock response with no page list
      const mockEmptyResponse = {
        data: {
          pageListCollection: {
            items: []
          }
        }
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockEmptyResponse)
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await api.getPageListBySlug('non-existent-slug');

      expect(result).toBeNull();
    });
  });
});
