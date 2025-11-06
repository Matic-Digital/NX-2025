import { type NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

import { getImageById } from '@/components/Image/ImageApi';
import { getCacheConfig } from '@/lib/cache-tags';

/**
 * Server-side API route for fetching Image data by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    // Get cache configuration for this content type and ID
    const cacheConfig = getCacheConfig('Image', { id });

    // Create cached function with proper tags
    const getCachedImage = unstable_cache(
      async (imageId: string, isPreview: boolean) => {
        return await getImageById(imageId, isPreview);
      },
      [`image-${id}`],
      {
        tags: cacheConfig.next?.tags || [],
        revalidate: cacheConfig.next?.revalidate || 3600
      }
    );

    const image = await getCachedImage(id, preview);

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      image: JSON.parse(JSON.stringify(image))
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image data' },
      { status: 500 }
    );
  }
}
