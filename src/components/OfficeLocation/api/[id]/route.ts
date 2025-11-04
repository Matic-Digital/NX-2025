import { type NextRequest, NextResponse } from 'next/server';

import { getLocationById } from '@/components/OfficeLocation/OfficeLocationApi';

/**
 * Server-side API route for fetching office location data by ID
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
      return NextResponse.json({ error: 'Office Location ID is required' }, { status: 400 });
    }

    // Get preview mode from query params
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    // Fetch office location data using server-side API
    const officeLocation = await getLocationById(id, preview);

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
