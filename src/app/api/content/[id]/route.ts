import { type NextRequest, NextResponse } from 'next/server';

function validateBearerToken(token: string): { valid: boolean; userId?: string; role?: string } {
  const tokenMap = new Map([
    ['fake_user_token', { userId: 'user1', role: 'user' }],
    ['regular_user_token', { userId: 'user2', role: 'user' }],
    ['test_token', { userId: 'user1', role: 'user' }],
    ['admin_token', { userId: 'admin', role: 'admin' }]
  ]);
  
  const tokenData = tokenMap.get(token);
  if (!tokenData) return { valid: false };
  
  return { valid: true, userId: tokenData.userId, role: tokenData.role };
}

const contentOwnership = new Map([
  ['1', 'user1'],
  ['2', 'user2'],
  ['100', 'admin'],
  ['999', 'user1']
]);

const content = new Map([
  ['1', { id: '1', title: 'User 1 Content', body: 'Private content body', owner: 'user1' }],
  ['2', { id: '2', title: 'User 2 Content', body: 'Another private content', owner: 'user2' }],
  ['100', { id: '100', title: 'Admin Content', body: 'Administrative content', owner: 'admin' }],
  ['999', { id: '999', title: 'User 1 Draft', body: 'Draft content', owner: 'user1' }]
]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const contentId = resolvedParams.id;
  
  // Validate content ID and prevent path traversal
  if (!contentId || contentId.includes('..') || contentId.includes('/') || contentId.includes('\\')) {
    return NextResponse.json(
      { error: 'Invalid content ID' },
      { status: 400 }
    );
  }
  
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  const token = authHeader.substring(7);
  const authResult = validateBearerToken(token);
  
  if (!authResult.valid || !authResult.userId) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
  
  const contentItem = content.get(contentId);
  if (!contentItem) {
    return NextResponse.json(
      { error: 'Content not found' },
      { status: 404 }
    );
  }
  
  const contentOwner = contentOwnership.get(contentId);
  if (authResult.role !== 'admin' && authResult.userId !== contentOwner) {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  }
  
  return NextResponse.json({
    content: {
      id: contentItem.id,
      title: contentItem.title,
      body: contentItem.body,
      owner: contentItem.owner
    },
    accessedBy: {
      userId: authResult.userId,
      role: authResult.role,
      timestamp: new Date().toISOString()
    }
  });
}
