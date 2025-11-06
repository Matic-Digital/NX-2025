import { type NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

import { getCollectionById } from '@/components/Collection/CollectionApi';
import { getCacheConfig } from '@/lib/cache-tags';

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

    // Get cache configuration for this content type and ID
    const cacheConfig = getCacheConfig('Collection', { id: resolvedParams.id });

    // Create cached function with proper tags
    const getCachedCollection = unstable_cache(
      async (collectionId: string, isPreview: boolean) => {
        return await getCollectionById(collectionId, isPreview);
      },
      [`collection-${resolvedParams.id}`],
      {
        tags: cacheConfig.next?.tags || [],
        revalidate: cacheConfig.next?.revalidate || 3600
      }
    );

    const collection = await getCachedCollection(resolvedParams.id, preview);

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
