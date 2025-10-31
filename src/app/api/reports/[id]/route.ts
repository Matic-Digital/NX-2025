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

const reportOwnership = new Map([
  ['1', 'user1'],
  ['2', 'user2'],
  ['100', 'admin'],
  ['999', 'user1']
]);

const reports = new Map([
  ['1', { id: '1', title: 'Monthly Report - User 1', data: 'Sensitive report data', owner: 'user1' }],
  ['2', { id: '2', title: 'Quarterly Report - User 2', data: 'Confidential metrics', owner: 'user2' }],
  ['100', { id: '100', title: 'System Admin Report', data: 'System-wide analytics', owner: 'admin' }],
  ['999', { id: '999', title: 'Annual Report - User 1', data: 'Year-end summary', owner: 'user1' }]
]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const reportId = resolvedParams.id;
  
  // Validate report ID and prevent path traversal
  if (!reportId || reportId.includes('..') || reportId.includes('/') || reportId.includes('\\')) {
    return NextResponse.json(
      { error: 'Invalid report ID' },
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
  
  const report = reports.get(reportId);
  if (!report) {
    return NextResponse.json(
      { error: 'Report not found' },
      { status: 404 }
    );
  }
  
  const reportOwner = reportOwnership.get(reportId);
  if (authResult.role !== 'admin' && authResult.userId !== reportOwner) {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  }
  
  return NextResponse.json({
    report: {
      id: report.id,
      title: report.title,
      data: report.data,
      owner: report.owner
    },
    accessedBy: {
      userId: authResult.userId,
      role: authResult.role,
      timestamp: new Date().toISOString()
    }
  });
}
