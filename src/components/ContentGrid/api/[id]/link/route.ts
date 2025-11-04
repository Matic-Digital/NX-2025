import { type NextRequest, NextResponse } from 'next/server';

import { getContentGridItemLink } from '@/components/ContentGrid/ContentGridApi';

/**
 * Server-side API route for fetching ContentGridItem link data by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'ContentGridItem ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    const linkData = await getContentGridItemLink(id, preview);

    if (!linkData) {
      return NextResponse.json({ error: 'ContentGridItem link not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      linkData: JSON.parse(JSON.stringify(linkData))
    });
  } catch (error) {
    console.error('Error fetching content grid item link:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content grid item link data' },
      { status: 500 }
    );
  }
}
