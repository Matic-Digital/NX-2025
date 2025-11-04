import { type NextRequest, NextResponse } from 'next/server';

import { getMegaMenuById } from '@/components/MegaMenu/MegaMenuApi';

/**
 * Server-side API route for fetching MegaMenu data by ID
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

    // Fetch mega menu data using server-side API
    const megaMenu = await getMegaMenuById(id, preview);

    if (!megaMenu) {
      return NextResponse.json({ error: 'MegaMenu not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      megaMenu: JSON.parse(JSON.stringify(megaMenu))
    });
  } catch (error) {
    console.error('Error fetching mega menu:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mega menu data' },
      { status: 500 }
    );
  }
}
