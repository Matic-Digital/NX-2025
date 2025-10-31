import { type NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Checkout not supported',
      message: 'E-commerce functionality is not implemented in this system'
    },
    { status: 501 }
  );
}
