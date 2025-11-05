import { type NextRequest, NextResponse } from 'next/server';

import { getCollectionById } from '@/components/Collection/CollectionApi';

/**
 * Server-side API route for fetching Collection by ID with enrichment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';
    const resolvedParams = await params;

    const collection = await getCollectionById(resolvedParams.id, preview);

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      collection: JSON.parse(JSON.stringify(collection))
    });
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection data' },
      { status: 500 }
    );
  }
}
