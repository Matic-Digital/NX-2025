import { type NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

import { getLocationById } from '@/components/OfficeLocation/OfficeLocationApi';
import { getCacheConfig } from '@/lib/cache-tags';

/**
 * Server-side API route for fetching office location data by ID
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
      return NextResponse.json({ error: 'Office Location ID is required' }, { status: 400 });
    }

    // Get preview mode from query params
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    // Get cache configuration for this content type and ID
    const cacheConfig = getCacheConfig('OfficeLocation', { id });

    // Create cached function with proper tags
    const getCachedOfficeLocation = unstable_cache(
      async (officeLocationId: string, isPreview: boolean) => {
        return await getLocationById(officeLocationId, isPreview);
      },
      [`officelocation-${id}`],
      {
        tags: cacheConfig.next?.tags || [],
        revalidate: cacheConfig.next?.revalidate || 3600
      }
    );

    const officeLocation = await getCachedOfficeLocation(id, preview);

    if (!officeLocation) {
      return NextResponse.json({ error: 'Office Location not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      officeLocation: JSON.parse(JSON.stringify(officeLocation))
    });
  } catch (error) {
    console.error('Error fetching office location:', error);
    return NextResponse.json(
      { error: 'Failed to fetch office location data' },
      { status: 500 }
    );
  }
}
