import { type NextRequest, NextResponse } from 'next/server';

function validateBearerToken(token: string): { valid: boolean; userId?: string; role?: string } {
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

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }
  
  const token = authHeader.substring(7);
  const authResult = validateBearerToken(token);
  
  if (!authResult.valid || !authResult.userId) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Invalid token' },
      { status: 401 }
    );
  }
  
  // Guest users cannot create content
  if (authResult.role === 'guest') {
    return NextResponse.json(
      { error: 'forbidden', message: 'Access denied' },
      { status: 403 }
    );
  }
  
  // Return content creation form/info
  return NextResponse.json({
    message: 'Content creation endpoint',
    allowedTypes: ['article', 'page', 'post'],
    userId: authResult.userId,
    role: authResult.role
  });
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }
  
  const token = authHeader.substring(7);
  const authResult = validateBearerToken(token);
  
  if (!authResult.valid || !authResult.userId) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Invalid token' },
      { status: 401 }
    );
  }
  
  // Guest users cannot create content
  if (authResult.role === 'guest') {
    return NextResponse.json(
      { error: 'forbidden', message: 'Access denied' },
      { status: 403 }
    );
  }
  
  // Create content (mock)
  return NextResponse.json({
    message: 'Content created successfully',
    contentId: 'content_' + Date.now(),
    createdBy: authResult.userId
  }, { status: 201 });
}
