import { type NextRequest, NextResponse } from 'next/server';

import { getHeaderById } from '@/components/Header/HeaderApi';

/**
 * Server-side API route for fetching header data by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Header ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    const header = await getHeaderById(id, preview);

    if (!header) {
      return NextResponse.json({ error: 'Header not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      header: JSON.parse(JSON.stringify(header))
    });
  } catch (error) {
    console.error('Error fetching header:', error);
    return NextResponse.json(
      { error: 'Failed to fetch header data' },
      { status: 500 }
    );
  }
}
