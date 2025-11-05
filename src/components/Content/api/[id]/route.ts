import { type NextRequest, NextResponse } from 'next/server';

import { getContentById } from '@/components/Content/ContentApi';

/**
 * Server-side API route for fetching Contentful Content data by ID
 * This replaces direct client-side Contentful API calls
 * Keeps environment variables secure on the server
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    // Get preview mode from query params
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    // Fetch content data using server-side API
    const contentData = await getContentById(id, preview);

    if (!contentData) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      content: JSON.parse(JSON.stringify(contentData))
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content data' },
      { status: 500 }
    );
  }
}
