import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Import session utilities from login route
const sessions = new Map<string, {
  userId: string;
  createdAt: number;
  lastAccess: number;
  userAgent?: string;
  ipAddress?: string;
}>();

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Generate cryptographically secure session ID
function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

function isValidSession(sessionId: string): boolean {
  const session = sessions.get(sessionId);
  if (!session) return false;
  
  const now = Date.now();
  if (now - session.lastAccess > SESSION_TIMEOUT) {
    sessions.delete(sessionId);
    return false;
  }
  
  session.lastAccess = now;
  return true;
}

export async function GET(_request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('sessionid');
  
  if (!sessionCookie?.value) {
    return NextResponse.json(
      { error: 'No session found', valid: false },
      { status: 401 }
    );
  }
  
  const isValid = isValidSession(sessionCookie.value);
  const session = sessions.get(sessionCookie.value);
  
  if (!isValid || !session) {
    return NextResponse.json(
      { error: 'Session expired or invalid', valid: false },
      { status: 401 }
    );
  }
  
  return NextResponse.json({
    valid: true,
    session: {
      userId: session.userId,
      createdAt: new Date(session.createdAt).toISOString(),
      lastAccess: new Date(session.lastAccess).toISOString(),
      timeRemaining: SESSION_TIMEOUT - (Date.now() - session.lastAccess)
    }
  });
}

export async function DELETE(_request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('sessionid');
  
  if (sessionCookie?.value) {
    sessions.delete(sessionCookie.value);
  }
  
  const response = NextResponse.json({ message: 'Session terminated' });
  
  // Clear session cookie
  response.cookies.set({
    name: 'sessionid',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  });
  
  return response;
}

export async function POST(request: NextRequest) {
  // Create a new session for token entropy testing
  const sessionId = generateSessionId();
  const userId = 'test-user';
  
  const now = Date.now();
  const sessionData = {
    userId,
    createdAt: now,
    lastAccess: now,
    userAgent: request.headers.get('user-agent') ?? '',
    ipAddress: request.headers.get('x-forwarded-for') ?? 'unknown'
  };
  
  // Store session
  sessions.set(sessionId, sessionData);
  
  // Return response with session cookie
  const response = NextResponse.json({
    success: true,
    message: 'Session created',
    sessionId: sessionId.substring(0, 8) + '...', // Only show partial ID in response
    created: new Date(now).toISOString()
  });
  
  // Set session cookie
  response.cookies.set({
    name: 'sessionid',
    value: sessionId,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_TIMEOUT / 1000,
    path: '/'
  });
  
  return response;
}
