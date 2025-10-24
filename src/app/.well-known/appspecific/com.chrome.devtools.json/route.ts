import { NextResponse } from 'next/server';

/**
 * Chrome DevTools specific endpoint
 * This prevents the request from falling back to catch-all routes
 * and trying to fetch content from Contentful
 */
export async function GET() {
  return NextResponse.json(
    {
      // Empty response - Chrome DevTools will handle gracefully
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Content-Type': 'application/json'
      }
    }
  );
}
