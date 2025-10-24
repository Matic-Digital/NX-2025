import { NextResponse } from 'next/server';

/**
 * General .well-known endpoint handler
 * Prevents .well-known requests from falling back to content routes
 * and causing unnecessary Contentful queries
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  
  // Log for debugging (will be removed in production via webpack config)
  console.log(`[.well-known] Request for: ${path}`);
  
  // Return 404 for unknown .well-known paths
  return NextResponse.json(
    {
      error: 'Not Found',
      message: `/.well-known/${path} not found`
    },
    {
      status: 404,
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache 404s for 1 hour
        'Content-Type': 'application/json'
      }
    }
  );
}
