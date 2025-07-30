import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware specifically for handling security headers for Contentful live preview
 * This runs before the main middleware and will only apply headers
 * needed for Contentful's live preview functionality
 */
export function middleware(request: NextRequest) {
  // Get the original response
  const response = NextResponse.next();
  
  // Check if we're in a preview environment
  const isPreviewEnv = 
    process.env.VERCEL_ENV === 'preview' || 
    process.env.VERCEL_ENV === 'prod-preview' ||
    process.env.NODE_ENV === 'development';
  
  // Check for Contentful's request (either from preview or with protection bypass)
  const isContentfulRequest = 
    (request.headers.get('referer')?.includes('contentful.com') ?? false) || 
    request.headers.has('x-vercel-protection-bypass');
  
  // Apply headers for preview environments or if it's a request from Contentful
  if (isPreviewEnv || isContentfulRequest) {
    // Set Content-Security-Policy header to allow Contentful to embed the site
    response.headers.set(
      'Content-Security-Policy',
      "frame-ancestors 'self' https://*.contentful.com https://app.contentful.com;"
    );
    
    // Remove X-Frame-Options header entirely
    // This is the most reliable way to ensure it doesn't interfere with embedding
    response.headers.delete('X-Frame-Options');
  }
  
  return response;
}

// Configure this middleware to run before any other middleware
export const config = {
  // Run before all other middleware, including the main middleware
  matcher: ['/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)'],
};
