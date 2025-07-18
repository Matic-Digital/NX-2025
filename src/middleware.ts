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

  // In production environments, especially on Vercel's Edge Runtime,
  // API calls from middleware can be problematic with authentication.
  // Instead, we'll let the page component handle nested page resolution.
  // 
  // Note: In development/local environments, the API call might work fine,
  // which explains why this issue only happens in production.
  console.log(`Middleware: Skipping API check for ${slug} in Edge Runtime, letting page handle routing`);
  
  // In a full production solution, you might implement a more robust approach like:
  // 1. Store page relationships in a more Edge-friendly storage solution
  // 2. Use Edge Config or similar to cache page relationships
  // 3. Move this logic entirely to the page component level

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
