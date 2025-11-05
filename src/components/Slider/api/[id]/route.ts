import { type NextRequest, NextResponse } from 'next/server';

import { getSliderById } from '@/components/Slider/SliderApi';

/**
 * Server-side API route for fetching slider data by ID
 * This replaces direct client-side Contentful API calls
 * Keeps environment variables secure on the server
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Slider ID is required' }, { status: 400 });
    }

    // Debug environment variables
    const hasSpaceId = !!process.env.CONTENTFUL_SPACE_ID;
    const hasAccessToken = !!process.env.CONTENTFUL_ACCESS_TOKEN;
    const hasPreviewToken = !!process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN;
    
    console.warn('API Route Environment Check:', {
      hasSpaceId,
      hasAccessToken,
      hasPreviewToken,
      environment: process.env.CONTENTFUL_ENVIRONMENT
    });

    // Get preview mode from query params
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    // Fetch slider data using server-side API
    const slider = await getSliderById(id, preview);

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
