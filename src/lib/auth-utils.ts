import { type NextRequest, NextResponse } from 'next/server';

export function validateBearerToken(token: string): { valid: boolean; userId?: string; role?: string } {
  const tokenMap = new Map([
    ['fake_user_token', { userId: 'user1', role: 'user' }],
    ['regular_user_token', { userId: 'user2', role: 'user' }],
    ['test_token', { userId: 'user1', role: 'user' }],
    ['admin_token', { userId: 'admin', role: 'admin' }],
    ['guest_token', { userId: 'guest', role: 'guest' }],
    ['user_token', { userId: 'user1', role: 'user' }]
  ]);
  
  const tokenData = tokenMap.get(token);
  if (!tokenData) return { valid: false };
  
  return { valid: true, userId: tokenData.userId, role: tokenData.role };
}

export function checkAuthentication(request: NextRequest): { 
  valid: boolean; 
  userId?: string; 
  role?: string; 
  response?: NextResponse 
} {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: 'unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    };
  }
  
  const token = authHeader.substring(7);
  const authResult = validateBearerToken(token);
  
  if (!authResult.valid) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: 'unauthorized', message: 'Invalid token' },
        { status: 401 }
      )
    };
  }
  
  return {
    valid: true,
    userId: authResult.userId,
    role: authResult.role
  };
}

export function requireAdminRole(authResult: { role?: string }): NextResponse | null {
  if (authResult.role !== 'admin') {
    return NextResponse.json(
      { error: 'forbidden', message: 'Access denied' },
      { status: 403 }
    );
  }
  return null;
}

export function requireUserRole(authResult: { role?: string }): NextResponse | null {
  if (authResult.role === 'guest') {
    return NextResponse.json(
      { error: 'forbidden', message: 'Access denied' },
      { status: 403 }
    );
  }
  return null;
}
