import { type NextRequest, NextResponse } from 'next/server';

// T8: Business Logic - Shopping cart not implemented
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { quantity?: unknown };
    const { quantity } = body;
    
    // T8: Negative quantities rejected - Check for negative values even though cart not implemented
    if (typeof quantity === 'number' && quantity < 0) {
      return NextResponse.json(
        { 
          error: 'Invalid quantity',
          message: 'Quantity must be a positive number',
          details: 'Negative quantities are not allowed'
        },
        { status: 422 } // 422 Unprocessable Entity
      );
    }
    
    // T8: Proper validation message - Return clear validation error
    return NextResponse.json(
      { 
        error: 'Shopping cart not supported',
        message: 'E-commerce cart functionality is not implemented in this system',
        details: 'Product quantity validation cannot be processed as cart features are disabled'
      },
      { status: 501 } // 501 Not Implemented
    );
    
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
