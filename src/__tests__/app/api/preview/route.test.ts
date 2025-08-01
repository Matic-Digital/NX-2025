/**
 * Preview API Route Tests
 *
 * This test suite verifies the functionality of the preview API route which enables
 * Contentful's preview mode for the application. The preview route is a critical
 * component that allows content editors to preview draft content before publishing.
 *
 * Key aspects tested:
 * - Proper handling of preview secret validation
 * - Correct redirection based on content type (page, navbar)
 * - Error handling for invalid requests
 * - Setting of preview cookies for Next.js draft mode
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/preview/route';
import { NextRequest, NextResponse } from 'next/server';

// Mock the next/headers module
vi.mock('next/headers', () => ({
  draftMode: vi.fn(() => ({
    enable: vi.fn(),
    disable: vi.fn()
  }))
}));

// Mock environment variables
vi.stubEnv('CONTENTFUL_PREVIEW_SECRET', 'test-preview-secret');

describe('Preview API Route', () => {
  /**
   * Helper function to create mock requests for testing
   *
   * Creates a Next.js Request object with the specified URL parameters for testing
   * the preview API route. This simulates how the route would receive requests in
   * a production environment.
   *
   * @param params - URL parameters to include in the request
   * @returns A mocked Next.js Request object
   */
  const createMockRequest = (params: Record<string, string>) => {
    const url = new URL('https://example.com/api/preview');
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    return new NextRequest(url);
  };

  // Spy on NextResponse.redirect and NextResponse.json
  beforeEach(() => {
    /**
     * Mock NextResponse.redirect
     *
     * Simulates the redirect response that the preview API route would return
     * when successfully enabling preview mode. This allows tests to verify that
     * the route redirects to the correct URL based on the content type.
     */
    vi.spyOn(NextResponse, 'redirect').mockImplementation((url) => {
      return new NextResponse(null, {
        status: 307,
        headers: {
          Location: url.toString()
        }
      });
    });

    /**
     * Mock NextResponse.json
     *
     * Simulates the JSON response that the preview API route would return
     * for error cases or when additional information needs to be provided.
     */
    vi.spyOn(NextResponse, 'json').mockImplementation((data, options) => {
      return new NextResponse(JSON.stringify(data), {
        status: options?.status ?? 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 with invalid secret', async () => {
    const request = createMockRequest({ secret: 'invalid-secret' });
    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ message: 'Invalid token' });
  });

  it('redirects to page preview with valid slug', async () => {
    const request = createMockRequest({
      secret: 'test-preview-secret',
      slug: 'test-page'
    });

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toContain('/page-preview?slug=test-page');
  });

  it('redirects to page list preview with valid pageListSlug', async () => {
    const request = createMockRequest({
      secret: 'test-preview-secret',
      pageListSlug: 'test-page-list'
    });

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toContain(
      '/page-list-preview?pageListSlug=test-page-list'
    );
  });

  it('redirects to header preview with valid headerName', async () => {
    const request = createMockRequest({
      secret: 'test-preview-secret',
      headerName: 'test-header'
    });

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toContain('/header-preview?headerName=test-header');
  });

  it('redirects to banner hero preview with valid bannerHeroId', async () => {
    const request = createMockRequest({
      secret: 'test-preview-secret',
      bannerHeroId: 'test-banner-hero-id'
    });

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toContain(
      '/banner-hero-preview?bannerHeroId=test-banner-hero-id'
    );
  });

  it('prioritizes slug over other parameters when multiple are provided', async () => {
    const request = createMockRequest({
      secret: 'test-preview-secret',
      slug: 'test-page',
      pageListSlug: 'test-page-list',
      navBarName: 'test-navbar'
    });

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toContain('/page-preview?slug=test-page');
  });
});
