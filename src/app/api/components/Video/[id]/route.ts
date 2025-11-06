import { type NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

import { getVideoById } from '@/components/Video/VideoApi';
import { getCacheConfig } from '@/lib/cache-tags';

/**
 * Server-side API route for fetching Video data by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    // Get cache configuration for this content type and ID
    const cacheConfig = getCacheConfig('Video', { id });

    // Create cached function with proper tags
    const getCachedVideo = unstable_cache(
      async (videoId: string, isPreview: boolean) => {
        return await getVideoById(videoId, isPreview);
      },
      [`video-${id}`],
      {
        tags: cacheConfig.next?.tags || [],
        revalidate: cacheConfig.next?.revalidate || 3600
      }
    );

    const video = await getCachedVideo(id, preview);

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      video: JSON.parse(JSON.stringify(video))
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video data' },
      { status: 500 }
    );
  }
}
