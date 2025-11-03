import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

// Note: We can't import directly from @/lib/api in middleware
// because middleware runs in a different environment
// Instead, we'll need to make a fetch request to our own API

// Helper function to create a URL for the API request
// function createApiUrl(baseUrl: string, path: string): string {
//   const url = new URL(baseUrl);
//   // Ensure we're using the same protocol, hostname, and port
//   return `${url.protocol}//${url.host}/api/check-page-parent?slug=${encodeURIComponent(path)}`;
// }

/**
 * Middleware for handling page redirections
 *
 * This middleware runs before a page is rendered and handles redirections
 * for pages that belong to a PageList. It checks if a requested page
 * belongs to a PageList and redirects to the nested URL structure if needed.
 */
export async function middleware(request: NextRequest) {
  // Handle CORS for preview pages and API routes first
  if (
    request.nextUrl.pathname.includes('-preview') ||
    request.nextUrl.pathname.startsWith('/api/preview') ||
    request.nextUrl.pathname.startsWith('/api/enable-draft') ||
    request.nextUrl.pathname.startsWith('/api/exit-preview') ||
    request.nextUrl.searchParams.has('preview') ||
    request.nextUrl.searchParams.has('contentful_preview')
  ) {
    const response = NextResponse.next();

    // Remove restrictive headers and allow iframe embedding from Contentful
    response.headers.delete('X-Frame-Options');
    response.headers.delete('X-Content-Type-Options');
    response.headers.delete('Referrer-Policy');
    
    // Set permissive CSP for live preview functionality
    response.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self' https://app.contentful.com https://images.ctfassets.net https://downloads.ctfassets.net",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.contentful.com https://vercel.live",
        "style-src 'self' 'unsafe-inline' https://app.contentful.com https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com https://app.contentful.com",
        "img-src 'self' data: blob: https: http:",
        "media-src 'self' https:",
        "connect-src 'self' https: wss:",
        "frame-src 'self' https://app.contentful.com",
        "frame-ancestors 'self' https://app.contentful.com",
        "object-src 'none'",
        "base-uri 'self'"
      ].join('; ')
    );

    return response;
  }

  // Create response for further processing
  const response = NextResponse.next();

  // Secure cookie handling - Apply to all responses
  const cookieHeader = response.headers.get('set-cookie');
  if (cookieHeader) {
    // Parse and secure existing cookies
    const cookies = cookieHeader.split(', ');
    const securedCookies = cookies.map(cookie => {
      // Add security attributes if not already present
      let securedCookie = cookie;
      
      // Add HttpOnly if not present
      if (!cookie.toLowerCase().includes('httponly')) {
        securedCookie += '; HttpOnly';
      }
      
      // Add Secure flag for HTTPS
      if (!cookie.toLowerCase().includes('secure') && request.nextUrl.protocol === 'https:') {
        securedCookie += '; Secure';
      }
      
      // Add SameSite if not present
      if (!cookie.toLowerCase().includes('samesite')) {
        securedCookie += '; SameSite=Strict';
      }
      
      return securedCookie;
    });
    
    response.headers.set('set-cookie', securedCookies.join(', '));
  }

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
    path.startsWith('/banner-hero-preview') ||
    path.startsWith('/section-heading-preview') ||
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
    return NextResponse.next();
  }

  // Extract the slug from the path (remove leading slash)
  const slug = path.substring(1);

  // Skip processing for empty slugs (homepage)
  if (!slug) {
    return NextResponse.next();
  }

  // In production environments, especially on Vercel's Edge Runtime,
  // API calls from middleware can be problematic with authentication.
  // Instead, we'll let the page component handle nested page resolution.

  // In a full production solution, you might implement a more robust approach like:
  // 1. Store page relationships in a more Edge-friendly storage solution
  // 2. Use Edge Config or similar to cache page relationships
  // 3. Move this logic entirely to the page component level

  // Continue with the request if no redirection is needed
  return response;
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
