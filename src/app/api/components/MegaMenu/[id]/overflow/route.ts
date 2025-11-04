import { type NextRequest, NextResponse } from 'next/server';

import { getOverflowMegaMenuById } from '@/components/MegaMenu/MegaMenuApi';

/**
 * Server-side API route for fetching overflow mega menu data by ID with associated images
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
      return NextResponse.json({ error: 'MegaMenu ID is required' }, { status: 400 });
    }

    // Get preview mode from query params
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    // Fetch overflow mega menu data using server-side API (includes associated images)
    const megaMenu = await getOverflowMegaMenuById(id, preview);

    if (!megaMenu) {
      return NextResponse.json({ error: 'Overflow MegaMenu not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      megaMenu: JSON.parse(JSON.stringify(megaMenu))
    });
  } catch (error) {
    console.error('Error fetching overflow mega menu:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overflow mega menu data' },
      { status: 500 }
    );
  }
}
