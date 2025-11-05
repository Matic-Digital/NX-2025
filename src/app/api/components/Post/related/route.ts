import { type NextRequest, NextResponse } from 'next/server';

import { getRelatedPosts } from '@/components/Post/PostApi';

/**
 * Server-side API route for fetching related Posts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categories = searchParams.get('categories');
    const excludeId = searchParams.get('excludeId');
    const limit = parseInt(searchParams.get('limit') || '3');
    const preview = searchParams.get('preview') === 'true';

    if (!categories) {
      return NextResponse.json({ error: 'Categories parameter is required' }, { status: 400 });
    }

    // Parse categories from comma-separated string
    const categoryArray = categories.split(',').map(cat => cat.trim()).filter(Boolean);

    const relatedPosts = await getRelatedPosts(categoryArray, excludeId || '', limit, preview);

    if (!relatedPosts) {
      return NextResponse.json({ error: 'Related posts not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      relatedPosts: JSON.parse(JSON.stringify(relatedPosts))
    });
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related posts data' },
      { status: 500 }
    );
  }
}
