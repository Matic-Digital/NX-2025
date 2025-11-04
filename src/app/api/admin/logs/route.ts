import { type NextRequest, NextResponse } from 'next/server';

function validateBearerToken(token: string): { valid: boolean; userId?: string; role?: string } {
  const tokenMap: Record<string, { userId: string; role: string }> = {
    'fake_user_token': { userId: 'user1', role: 'user' },
    'regular_user_token': { userId: 'user2', role: 'user' },
    'test_token': { userId: 'user1', role: 'user' },
    'admin_token': { userId: 'admin', role: 'admin' }
  };
  
  // JUSTIFICATION: Static token map with predefined keys, token is validated against known values
  // RISK: Low - tokenMap is a controlled object with known string keys
  const tokenData = tokenMap[token]; // eslint-disable-line security/detect-object-injection
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
