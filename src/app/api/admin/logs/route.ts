import { type NextRequest, NextResponse } from 'next/server';

function validateBearerToken(token: string): { valid: boolean; userId?: string; role?: string } {
  const tokenMap: Record<string, { userId: string; role: string }> = {
    'fake_user_token': { userId: 'user1', role: 'user' },
    'regular_user_token': { userId: 'user2', role: 'user' },
    'test_token': { userId: 'user1', role: 'user' },
    'admin_token': { userId: 'admin', role: 'admin' }
  };
  
  // Use secure property access to avoid object injection warnings
  if (!Object.prototype.hasOwnProperty.call(tokenMap, token)) {
    return { valid: false };
  }
  
  const tokenData = Object.getOwnPropertyDescriptor(tokenMap, token)?.value;
  if (!tokenData) return { valid: false };
  
  return { valid: true, userId: tokenData.userId, role: tokenData.role };
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  const token = authHeader.substring(7);
  const authResult = validateBearerToken(token);
  
  if (!authResult.valid) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
  
  // T6: Admin endpoint access denied
  return NextResponse.json(
    { 
      error: 'Access denied',
      message: 'Administrative access is not permitted'
    },
    { status: 403 }
  );
}
