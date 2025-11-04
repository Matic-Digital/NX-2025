import { type NextRequest, NextResponse } from 'next/server';

import { getRecentPostsForMegaMenu, getRecentPostsForMegaMenuByCategory } from '@/components/Post/PostApi';

/**
 * Server-side API route for fetching recent posts for mega menu
 * This replaces direct client-side Contentful API calls
 * Keeps environment variables secure on the server
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limitParam = searchParams.get('limit');
    const preview = searchParams.get('preview') === 'true';
    
    const limit = limitParam ? parseInt(limitParam, 10) : 3;

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 10) {
      return NextResponse.json({ error: 'Invalid limit parameter' }, { status: 400 });
    }

    // Fetch posts based on whether category is provided
    const postsResponse = category 
      ? await getRecentPostsForMegaMenuByCategory(category, limit, preview)
      : await getRecentPostsForMegaMenu(limit, preview);

    if (!postsResponse) {
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      posts: JSON.parse(JSON.stringify(postsResponse))
    });
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent posts data' },
      { status: 500 }
    );
  }
}
