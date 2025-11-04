import { type NextRequest, NextResponse } from 'next/server';

import { getImageById } from '@/components/Image/ImageApi';

/**
 * Server-side API route for fetching Image data by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    const image = await getImageById(id, preview);

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
