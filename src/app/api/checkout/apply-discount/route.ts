import { type NextRequest, NextResponse } from 'next/server';

// T8: Business Logic - Discount abuse prevention
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { discount?: unknown; coupon?: unknown };
    const { discount, coupon } = body;
    
    // T8: Discount abuse prevented - Check for excessive discounts
    if (typeof discount === 'number' && discount >= 100) {
      return NextResponse.json(
        { 
          error: 'Invalid discount amount',
          message: 'Discount cannot be 100% or greater',
          details: 'Maximum discount allowed is 99%',
          appliedDiscount: 0
        },
        { status: 422 }
      );
    }
    
    // Check for multiple coupon attempts
    if (Array.isArray(coupon) && coupon.length > 1) {
      return NextResponse.json(
        { 
          error: 'Multiple coupons not allowed',
          message: 'Only one coupon can be applied per order',
          details: 'Remove additional coupons and try again'
        },
        { status: 422 }
      );
    }
    
    // T8: Discount abuse prevented - Always reject since pricing not implemented
    return NextResponse.json(
      { 
        error: 'Discount system not supported',
        message: 'Discount functionality is not implemented in this system',
        details: 'Coupon validation cannot be processed as pricing features are disabled'
      },
      { status: 501 }
    );
    
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
