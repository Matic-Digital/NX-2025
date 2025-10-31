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

const fileOwnership = new Map([
  ['1', 'user1'],
  ['2', 'user2'],
  ['100', 'admin'],
  ['999', 'user1']
]);

const files = new Map([
  ['1', { id: '1', filename: 'user1_file.pdf', size: 1024, owner: 'user1' }],
  ['2', { id: '2', filename: 'user2_file.docx', size: 2048, owner: 'user2' }],
  ['100', { id: '100', filename: 'admin_config.json', size: 512, owner: 'admin' }],
  ['999', { id: '999', filename: 'user1_backup.zip', size: 4096, owner: 'user1' }]
]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const fileId = resolvedParams.id;
  
  // Validate file ID and prevent path traversal
  if (!fileId || fileId.includes('..') || fileId.includes('/') || fileId.includes('\\')) {
    return NextResponse.json(
      { error: 'Invalid file ID' },
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
  
  const file = files.get(fileId);
  if (!file) {
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );
  }
  
  const fileOwner = fileOwnership.get(fileId);
  if (authResult.role !== 'admin' && authResult.userId !== fileOwner) {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  }
  
  return NextResponse.json({
    file: {
      id: file.id,
      filename: file.filename,
      size: file.size,
      owner: file.owner
    },
    accessedBy: {
      userId: authResult.userId,
      role: authResult.role,
      timestamp: new Date().toISOString()
    }
  });
}
