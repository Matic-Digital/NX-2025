import { type NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

import { getSectionHeadingById } from '@/components/SectionHeading/SectionHeadingApi';
import { getCacheConfig } from '@/lib/cache-tags';

/**
 * Server-side API route for fetching SectionHeading data by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'SectionHeading ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    // Get cache configuration for this content type and ID
    const cacheConfig = getCacheConfig('SectionHeading', { id });


    // Create cached function with proper tags
    const getCachedSectionHeading = unstable_cache(
      async (sectionHeadingId: string, isPreview: boolean) => {
        return await getSectionHeadingById(sectionHeadingId, isPreview);
      },
      [`sectionheading-${id}`],
      {
        tags: cacheConfig.next?.tags || [],
        revalidate: cacheConfig.next?.revalidate || 3600
      }
    );

    const sectionHeading = await getCachedSectionHeading(id, preview);

    if (!sectionHeading) {
      return NextResponse.json({ error: 'SectionHeading not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      sectionHeading: JSON.parse(JSON.stringify(sectionHeading))
    });
  } catch (error) {
    console.error('Error fetching section heading:', error);
    return NextResponse.json(
      { error: 'Failed to fetch section heading data' },
      { status: 500 }
    );
  }
}
