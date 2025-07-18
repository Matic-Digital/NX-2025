import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Note: We can't import directly from @/lib/api in middleware
// because middleware runs in a different environment
// Instead, we'll need to make a fetch request to our own API

// Helper function to create a URL for the API request
function createApiUrl(baseUrl: string, path: string): string {
  const url = new URL(baseUrl);
  // Ensure we're using the same protocol, hostname, and port
  return `${url.protocol}//${url.host}/api/check-page-parent?slug=${encodeURIComponent(path)}`;
}

/**
 * Middleware for handling page redirections
 *
 * This middleware runs before a page is rendered and handles redirections
 * for pages that belong to a PageList. It checks if a requested page
 * belongs to a PageList and redirects to the nested URL structure if needed.
 */
export async function middleware(request: NextRequest) {
  // Only process GET requests to potential page routes
  if (request.method !== 'GET') {
    return NextResponse.next();
  }

  // Extract the path from the URL
  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Skip processing for special paths
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.startsWith('/page-preview') ||
    path.startsWith('/page-list-preview') ||
    path.startsWith('/hero-preview') ||
    path.startsWith('/header-preview') ||
    path.startsWith('/footer-preview') ||
    path === '/favicon.ico' ||
    path.endsWith('.jpg') ||
    path.endsWith('.png') ||
    path.endsWith('.svg') ||
    path.endsWith('.css') ||
    path.endsWith('.js')
  ) {
    return NextResponse.next();
  }

  // Skip paths that already have a nested structure (but not the root path)
  // We're looking for paths like /resources/templates, which have more than one segment
  const segments = path.split('/').filter(Boolean);
  if (segments.length > 1) {
    console.log(`Middleware: Skipping path with multiple segments: ${path}`);
    return NextResponse.next();
  }

  // Extract the slug from the path (remove leading slash)
  const slug = path.substring(1);

  // Skip processing for empty slugs (homepage)
  if (!slug) {
    return NextResponse.next();
  }

  try {
    // Make a request to our API to check if this page belongs to a PageList
    // We need to use the full URL including protocol, hostname, and port
    const apiUrl = createApiUrl(request.url, slug);
    console.log(`Middleware: Checking if ${slug} belongs to a PageList via ${apiUrl}`);

    // Forward authorization headers and cookies from the original request
    const headers = new Headers({
      'Content-Type': 'application/json'
    });
    
    // Forward authorization headers if present
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers.set('authorization', authHeader);
    }
    
    const response = await fetch(apiUrl, {
      headers,
      // Include credentials to send cookies
      credentials: 'include'
    });

    if (response.ok) {
      const result = (await response.json()) as {
        parentSlug: string | null;
        pageId?: string;
        pageName?: string;
      };
      console.log(`Middleware: API response for ${slug}:`, result);

      if (result.parentSlug) {
        // If it belongs to a PageList, redirect to the nested URL
        const redirectUrl = `/${result.parentSlug}/${slug}`;
        console.log(`Middleware: Redirecting ${slug} to ${redirectUrl}`);

        // Create a new URL for the redirect
        const newUrl = new URL(redirectUrl, request.url);
        return NextResponse.redirect(newUrl);
      }
    } else {
      console.error(`Middleware: API request failed with status ${response.status}`);
    }
  } catch (error) {
    console.error('Middleware error checking page parent:', error);
  }

  // Continue with the request if no redirection is needed
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all paths except those starting with:
    // - _next (Next.js internal files)
    // - api (API routes)
    // - static files (images, favicon, etc.)
    '/((?!_next|api|favicon.ico|.*\\.).*)'
  ]
};
