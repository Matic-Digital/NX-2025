import { type NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

import { getFooterById } from '@/components/Footer/FooterApi';
import { getCacheConfig } from '@/lib/cache-tags';

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

    // Get cache configuration for this content type and ID
    const cacheConfig = getCacheConfig('Footer', { id });

    // Create cached function with proper tags
    const getCachedFooter = unstable_cache(
      async (footerId: string, isPreview: boolean) => {
        return await getFooterById(footerId, isPreview);
      },
      [`footer-${id}`],
      {
        tags: cacheConfig.next?.tags || [],
        revalidate: cacheConfig.next?.revalidate || 3600
      }
    );

    const footer = await getCachedFooter(id, preview);

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
