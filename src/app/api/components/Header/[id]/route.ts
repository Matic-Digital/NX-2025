import { type NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

import { getHeaderById } from '@/components/Header/HeaderApi';
import { getCacheConfig } from '@/lib/cache-tags';

/**
 * Server-side API route for fetching header data by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Header ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    // Get cache configuration for this content type and ID
    const cacheConfig = getCacheConfig('Header', { id });

    // Create cached function with proper tags
    const getCachedHeader = unstable_cache(
      async (headerId: string, isPreview: boolean) => {
        return await getHeaderById(headerId, isPreview);
      },
      [`header-${id}`],
      {
        tags: cacheConfig.next?.tags || [],
        revalidate: cacheConfig.next?.revalidate || 3600
      }
    );

    const header = await getCachedHeader(id, preview);

    if (!header) {
      return NextResponse.json({ error: 'Header not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      header: JSON.parse(JSON.stringify(header))
    });
  } catch (error) {
    console.error('Error fetching header:', error);
    return NextResponse.json(
      { error: 'Failed to fetch header data' },
      { status: 500 }
    );
  }
}
