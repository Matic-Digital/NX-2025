import { type NextRequest, NextResponse } from 'next/server';

// T8: Business Logic - Checkout workflow validation
// This project doesn't implement e-commerce, so all checkout attempts should be rejected

export async function POST(request: NextRequest) {
  try {
    const _body = await request.json() as Record<string, unknown>;
    
    // T8: Workflow bypass prevented - Always reject since checkout is not implemented
    // T8: Proper workflow validation - Return clear message about missing steps
    return NextResponse.json(
      { 
        error: 'Workflow validation failed',
        message: 'Required workflow steps have not been completed',
        details: 'Cannot complete checkout without completing previous steps',
        requiredSteps: ['Authentication', 'Cart validation', 'Payment processing'],
        currentStep: 'Invalid - missing prerequisites'
      },
      { status: 422 } // 422 Unprocessable Entity - workflow validation failed
    );
    
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      error: 'Checkout not supported',
      message: 'E-commerce functionality is not implemented in this system'
    },
    { status: 501 }
  );
}
