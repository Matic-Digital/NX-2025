import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

/**
 * CSP Violation Report Endpoint
 * 
 * This endpoint receives Content Security Policy violation reports
 * and logs them for security monitoring purposes.
 */
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    
    // Log CSP violations for monitoring
    // eslint-disable-next-line no-console -- Security logging is intentional for CSP violations
    console.warn('🚨 CSP Violation Report:', {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      violation: body as Record<string, unknown>,
      url: request.url
    });
    
    // In production, you might want to:
    // 1. Send to a logging service (e.g., Sentry, LogRocket)
    // 2. Store in a database for analysis
    // 3. Alert security team for critical violations
    
    return NextResponse.json({ status: 'received' }, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line no-console -- Error logging is intentional for debugging
    console.error('Error processing CSP report:', error);
    return NextResponse.json({ error: 'Invalid report' }, { status: 400 });
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
