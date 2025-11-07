import { type NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

import { getSliderById } from '@/components/Slider/SliderApi';
import { getCacheConfig } from '@/lib/cache-tags';

/**
 * Server-side API route for fetching slider data by ID
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
      return NextResponse.json({ error: 'Slider ID is required' }, { status: 400 });
    }

    // Get preview mode from query params
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    // Get cache configuration for this content type and ID
    const cacheConfig = getCacheConfig('Slider', { id });

    // Create cached function with proper tags
    const getCachedSlider = unstable_cache(
      async (sliderId: string, isPreview: boolean) => {
        return await getSliderById(sliderId, isPreview);
      },
      [`slider-${id}`],
      {
        tags: cacheConfig.next?.tags || [],
        revalidate: cacheConfig.next?.revalidate || 3600
      }
    );

    // Fetch slider data using server-side API
    const slider = await getCachedSlider(id, preview);

    if (!slider) {
      return NextResponse.json({ error: 'Slider not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      slider: JSON.parse(JSON.stringify(slider))
    });
  } catch (error) {
    console.error('Error fetching slider:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slider data' },
      { status: 500 }
    );
  }
}
