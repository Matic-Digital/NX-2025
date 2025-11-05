import { type NextRequest, NextResponse } from 'next/server';

import { getAllServices } from '@/components/Service/ServiceApi';

/**
 * Server-side API route for fetching all Services with enrichment
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    const services = await getAllServices(preview);

    if (!services) {
      return NextResponse.json({ error: 'Services not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      services: JSON.parse(JSON.stringify(services))
    });
  } catch (error) {
    console.error('Error fetching all services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services data' },
      { status: 500 }
    );
  }
}
