import { type NextRequest, NextResponse } from 'next/server';

import { getFooterById } from '@/components/Footer/FooterApi';

/**
 * Server-side API route for fetching footer data by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Footer ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    const footer = await getFooterById(id, preview);

    if (!footer) {
      return NextResponse.json({ error: 'Footer not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      footer: JSON.parse(JSON.stringify(footer))
    });
  } catch (error) {
    console.error('Error fetching footer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch footer data' },
      { status: 500 }
    );
  }
}
