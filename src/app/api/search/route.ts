import { type NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const WINDOW_MS = 60 * 1000; // 1 minute

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded ? (forwarded.split(',')[0] ?? 'unknown') : (realIp ?? 'unknown');
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = requestCounts.get(key);
  
  if (!record || now > record.resetTime) {
    // Reset or create new record
    const newRecord = { count: 1, resetTime: now + WINDOW_MS };
    requestCounts.set(key, newRecord);
    return { allowed: true, remaining: RATE_LIMIT - 1, resetTime: newRecord.resetTime };
  }
  
  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count, resetTime: record.resetTime };
}

// T8: Rate limiting implementation
export async function GET(request: NextRequest) {
  const rateLimitKey = getRateLimitKey(request);
  const rateLimit = checkRateLimit(rateLimitKey);
  
  // T8: Rate limiting active - Block excessive requests
  if (!rateLimit.allowed) {
    const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
    
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded',
        message: 'Too many requests, please try again later',
        retryAfter: retryAfter
      },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': RATE_LIMIT.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimit.resetTime.toString()
        }
      }
    );
  }
  
  // T8: Some requests allowed - Process valid requests
  // T8: Proper rate limit headers - Include rate limit info
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  return NextResponse.json(
    {
      query,
      results: [],
      message: 'Search functionality is limited in this system',
      timestamp: new Date().toISOString()
    },
    {
      headers: {
        'X-RateLimit-Limit': RATE_LIMIT.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString()
      }
    }
  );
}
