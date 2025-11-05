import { type NextRequest, NextResponse } from 'next/server';

import { getAllPageLists } from '@/components/PageList/PageListApi';

/**
 * Server-side API route for fetching all PageLists with enrichment
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    const pageLists = await getAllPageLists(preview);

    if (!pageLists) {
      return NextResponse.json({ error: 'PageLists not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      pageLists: JSON.parse(JSON.stringify(pageLists))
    });
  } catch (error) {
    console.error('Error fetching all page lists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page lists data' },
      { status: 500 }
    );
  }
}
