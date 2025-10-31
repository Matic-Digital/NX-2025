import { type NextRequest, NextResponse } from 'next/server';

// T7: Password policy enforcement - This project doesn't implement user registration
// All registration attempts should be rejected since this feature is not implemented

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { password?: unknown; email?: unknown };
    const { password, email: _email } = body;
    
    // T7: Weak password rejected - Always reject since registration is not implemented
    // T7: Password policy enforced - Return policy message explaining why it's rejected
    if (password) {
      // Check for weak passwords specifically
      const weakPasswords = ['password', '123456', 'password123', 'admin', 'test'];
      if (typeof password === 'string' && weakPasswords.includes(password.toLowerCase())) {
        return NextResponse.json(
          { 
            error: 'Weak password detected',
            message: 'Password does not meet security requirements',
            details: 'Password is too weak and commonly used',
            requirements: 'Password must be strong and unique'
          },
          { status: 422 } // 422 Unprocessable Entity - validation failed
        );
      }
      
      // General password policy enforcement
      return NextResponse.json(
        { 
          error: 'Password policy violation',
          message: 'Password does not meet requirements',
          details: 'Registration is disabled but password validation detected policy violations',
          requirements: 'Minimum 8 characters, uppercase, lowercase, numbers, special characters'
        },
        { status: 422 } // 422 Unprocessable Entity
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Registration not supported',
        message: 'User registration is not implemented in this system'
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

// Also handle GET requests
export async function GET() {
  return NextResponse.json(
    { 
      error: 'Registration not supported',
      message: 'User registration is not implemented in this system'
    },
    { status: 501 }
  );
}
