import { type NextRequest, NextResponse } from 'next/server';

import { getAllProducts } from '@/components/Product/ProductApi';

/**
 * Server-side API route for fetching all Products with enrichment
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    const products = await getAllProducts(preview);

    if (!products) {
      return NextResponse.json({ error: 'Products not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      products: JSON.parse(JSON.stringify(products))
    });
  } catch (error) {
    console.error('Error fetching all products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products data' },
      { status: 500 }
    );
  }
}
