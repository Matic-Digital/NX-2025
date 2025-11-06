import { type NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

import { getContentGridItemById } from '@/components/ContentGrid/ContentGridApi';
import { getCacheConfig } from '@/lib/cache-tags';

/**
 * Server-side API route for fetching ContentGridItem data by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'ContentGridItem ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    // Get cache configuration for this content type and ID
    const cacheConfig = getCacheConfig('ContentGrid', { id });

    // Create cached function with proper tags
    const getCachedContentGridItem = unstable_cache(
      async (contentGridId: string, isPreview: boolean) => {
        return await getContentGridItemById(contentGridId, isPreview);
      },
      [`contentgrid-${id}`],
      {
        tags: cacheConfig.next?.tags || [],
        revalidate: cacheConfig.next?.revalidate || 3600
      }
    );

    const contentGridItem = await getCachedContentGridItem(id, preview);

    if (!contentGridItem) {
      return NextResponse.json({ error: 'ContentGridItem not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      contentGridItem: JSON.parse(JSON.stringify(contentGridItem))
    });
  } catch (error) {
    console.error('Error fetching content grid item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content grid item data' },
      { status: 500 }
    );
  }
}
