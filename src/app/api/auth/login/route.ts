import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { 
  generateSessionId, 
  enforceSessionLimits, 
  sessions, 
  userSessions, 
  SESSION_TIMEOUT
} from '@/lib/session-utils';

export async function GET(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') ?? '';
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 
                   request.headers.get('x-real-ip') ?? 
                   'unknown';
  
  // Check for existing session cookie (potential session fixation attempt)
  const cookieStore = await cookies();
  const _existingSessionCookie = cookieStore.get('sessionid');
  
  // Always generate a new session ID (prevents session fixation)
  const sessionId = generateSessionId();
  const userId = 'test-user'; // In real app, this would come from authentication
  
  const now = Date.now();
  const sessionData = {
    userId,
    createdAt: now,
    lastAccess: now,
    userAgent,
    ipAddress
  };
  
  // Store session
  sessions.set(sessionId, sessionData);
  
  // Enforce concurrent session limits
  enforceSessionLimits(userId, sessionId);
  
  // Set secure session cookie
  const response = NextResponse.json({
    success: true,
    message: 'Session created',
    sessionInfo: {
      created: new Date(now).toISOString(),
      maxAge: SESSION_TIMEOUT / 1000,
      concurrent: userSessions.get(userId)?.size ?? 1
    }
  });
  
  // Set session cookie with security flags
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

// T8: Login rate limiting
const loginAttempts = new Map<string, { count: number; resetTime: number; locked: boolean }>();
const LOGIN_RATE_LIMIT = 5; // attempts per 15 minutes
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

function getLoginRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded ? (forwarded.split(',')[0] ?? 'unknown') : (realIp ?? 'unknown');
  return ip;
}

function checkLoginRateLimit(key: string): { allowed: boolean; locked: boolean; remaining: number } {
  const now = Date.now();
  const record = loginAttempts.get(key);
  
  if (!record || now > record.resetTime) {
    // Reset or create new record
    const newRecord = { count: 1, resetTime: now + LOGIN_WINDOW_MS, locked: false };
    loginAttempts.set(key, newRecord);
    return { allowed: true, locked: false, remaining: LOGIN_RATE_LIMIT - 1 };
  }
  
  // Check if account is locked
  if (record.locked && now < record.resetTime) {
    return { allowed: false, locked: true, remaining: 0 };
  }
  
  if (record.count >= LOGIN_RATE_LIMIT) {
    // Lock the account
    record.locked = true;
    record.resetTime = now + LOCKOUT_DURATION;
    return { allowed: false, locked: true, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, locked: false, remaining: LOGIN_RATE_LIMIT - record.count };
}

export async function POST(request: NextRequest) {
  // T8: Login rate limiting enforced
  const rateLimitKey = getLoginRateLimitKey(request);
  const rateLimit = checkLoginRateLimit(rateLimitKey);
  
  if (!rateLimit.allowed) {
    const status = rateLimit.locked ? 423 : 429; // 423 Locked, 429 Too Many Requests
    const message = rateLimit.locked ? 
      'Account temporarily locked due to too many failed attempts' :
      'Too many login attempts, please try again later';
    
    return NextResponse.json(
      { 
        error: message,
        message: rateLimit.locked ? 'Account is locked' : 'Rate limit exceeded',
        locked: rateLimit.locked
      },
      { status }
    );
  }
  
  // T7: This project doesn't implement password-based authentication
  // Always reject password login attempts since this feature is not implemented
  try {
    const body = await request.json() as { password?: string };
    const { password: _password } = body;
    
    // T7: Password not in response - never echo back passwords
    return NextResponse.json(
      { 
        error: 'Authentication method not supported',
        message: 'Password-based authentication is not implemented in this system'
      },
      { status: 501 } // 501 Not Implemented
    );
    
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

