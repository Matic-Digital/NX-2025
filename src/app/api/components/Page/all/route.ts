import { type NextRequest, NextResponse } from 'next/server';

import { getAllPagesMinimal } from '@/components/Page/PageApi';

/**
 * Server-side API route for fetching all Pages with enrichment
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    const pages = await getAllPagesMinimal(preview);

    if (!pages) {
      return NextResponse.json({ error: 'Pages not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      pages: JSON.parse(JSON.stringify(pages))
    });
  } catch (error) {
    console.error('Error fetching all pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages data' },
      { status: 500 }
    );
  }
}
