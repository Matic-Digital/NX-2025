import { type NextRequest, NextResponse } from 'next/server';

import { getAllSolutions } from '@/components/Solution/SolutionApi';

/**
 * Server-side API route for fetching all Solutions with enrichment
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    const solutions = await getAllSolutions(preview);

    if (!solutions) {
      return NextResponse.json({ error: 'Solutions not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      solutions: JSON.parse(JSON.stringify(solutions))
    });
  } catch (error) {
    console.error('Error fetching all solutions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch solutions data' },
      { status: 500 }
    );
  }
}
