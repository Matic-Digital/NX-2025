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

// Mock document ownership
const documentOwnership = new Map([
  ['1', 'user1'],
  ['2', 'user2'],
  ['100', 'admin'],
  ['999', 'user1']
]);

const documents = new Map([
  ['1', { id: '1', title: 'User 1 Document', content: 'Private content for user1', owner: 'user1' }],
  ['2', { id: '2', title: 'User 2 Document', content: 'Private content for user2', owner: 'user2' }],
  ['100', { id: '100', title: 'Admin Document', content: 'Admin-only content', owner: 'admin' }],
  ['999', { id: '999', title: 'Another User 1 Document', content: 'More private content', owner: 'user1' }]
]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const documentId = resolvedParams.id;
  
  // Validate document ID format and prevent path traversal
  if (!documentId || documentId.includes('..') || documentId.includes('/') || documentId.includes('\\')) {
    return NextResponse.json(
      { error: 'Invalid document ID' },
      { status: 400 }
    );
  }
  
  // Check authentication
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
  
  // Check if document exists
  const document = documents.get(documentId);
  if (!document) {
    return NextResponse.json(
      { error: 'Document not found' },
      { status: 404 }
    );
  }
  
  // Check authorization - users can only access their own documents unless admin
  const documentOwner = documentOwnership.get(documentId);
  if (authResult.role !== 'admin' && authResult.userId !== documentOwner) {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  }
  
  // Return document
  return NextResponse.json({
    document: {
      id: document.id,
      title: document.title,
      content: document.content,
      owner: document.owner
    },
    accessedBy: {
      userId: authResult.userId,
      role: authResult.role,
      timestamp: new Date().toISOString()
    }
  });
}
