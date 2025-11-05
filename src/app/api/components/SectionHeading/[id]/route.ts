import { type NextRequest, NextResponse } from 'next/server';

import { getSectionHeadingById } from '@/components/SectionHeading/SectionHeadingApi';

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

    const sectionHeading = await getSectionHeadingById(id, preview);

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
