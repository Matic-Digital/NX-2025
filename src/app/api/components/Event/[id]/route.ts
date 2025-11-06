import { type NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

import { getEventById } from '@/components/Event/EventApi';
import { getCacheConfig } from '@/lib/cache-tags';

/**
 * Server-side API route for fetching Event by ID with enrichment
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
    const cacheConfig = getCacheConfig('Event', { id: resolvedParams.id });

    // Create cached function with proper tags
    const getCachedEvent = unstable_cache(
      async (eventId: string, isPreview: boolean) => {
        return await getEventById(eventId, isPreview);
      },
      [`event-${resolvedParams.id}`],
      {
        tags: cacheConfig.next?.tags || [],
        revalidate: cacheConfig.next?.revalidate || 3600
      }
    );

    const event = await getCachedEvent(resolvedParams.id, preview);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      event: JSON.parse(JSON.stringify(event))
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event data' },
      { status: 500 }
    );
  }
}
