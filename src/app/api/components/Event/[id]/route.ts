import { type NextRequest, NextResponse } from 'next/server';

import { getEventById } from '@/components/Event/EventApi';

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

    const event = await getEventById(resolvedParams.id, preview);

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
