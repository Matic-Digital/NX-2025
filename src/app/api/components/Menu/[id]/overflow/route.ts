import { type NextRequest, NextResponse } from 'next/server';

import { getOverflowMenuById } from '@/components/Menu/MenuApi';

/**
 * Server-side API route for fetching overflow menu data by ID with associated images
 * This replaces direct client-side Contentful API calls
 * Keeps environment variables secure on the server
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Menu ID is required' }, { status: 400 });
    }

    // Get preview mode from query params
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    // Fetch overflow menu data using server-side API (includes associated images)
    const menu = await getOverflowMenuById(id, preview);

    if (!menu) {
      return NextResponse.json({ error: 'Overflow Menu not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      menu: JSON.parse(JSON.stringify(menu))
    });
  } catch (error) {
    console.error('Error fetching overflow menu:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overflow menu data' },
      { status: 500 }
    );
  }
}
