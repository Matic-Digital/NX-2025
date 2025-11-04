import { type NextRequest, NextResponse } from 'next/server';

import { getAllPosts } from '@/components/Post/PostApi';

/**
 * Server-side API route for fetching all Posts with enrichment
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    const posts = await getAllPosts(preview);

    if (!posts) {
      return NextResponse.json({ error: 'Posts not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      posts: JSON.parse(JSON.stringify(posts))
    });
  } catch (error) {
    console.error('Error fetching all posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts data' },
      { status: 500 }
    );
  }
}
