import { type NextRequest, NextResponse } from 'next/server';

import { getEventById } from '@/components/Event/EventApi';

/**
 * Server-side API route for fetching event data by ID
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
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Get preview mode from query params
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    // Fetch event data using server-side API
    const event = await getEventById(id, preview);

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
