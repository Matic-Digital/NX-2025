/**
 * Rate limiting implementation using in-memory storage
 * For production, consider using Redis or similar persistent storage
 */

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private cache = new Map<string, RateLimitEntry>();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit = 100, windowMs = 60 * 1000) { // 100 requests per minute by default
    this.limit = limit;
    this.windowMs = windowMs;
    
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  async limitRequest(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const _windowStart = now - this.windowMs;
    
    // Get or create entry
    let entry = this.cache.get(identifier);
    
    if (!entry || entry.resetTime <= now) {
      // Create new window
      entry = {
        count: 1,
        resetTime: now + this.windowMs
      };
      this.cache.set(identifier, entry);
      
      return {
        success: true,
        limit: this.limit,
        remaining: this.limit - 1,
        reset: entry.resetTime
      };
    }
    
    // Check if within limit
    if (entry.count >= this.limit) {
      return {
        success: false,
        limit: this.limit,
        remaining: 0,
        reset: entry.resetTime
      };
    }
    
    // Increment count
    entry.count++;
    this.cache.set(identifier, entry);
    
    return {
      success: true,
      limit: this.limit,
      remaining: this.limit - entry.count,
      reset: entry.resetTime
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.resetTime <= now) {
        this.cache.delete(key);
      }
    }
  }

  // Reset rate limit for a specific identifier (useful for testing)
  reset(identifier: string): void {
    this.cache.delete(identifier);
  }

  // Get current status without incrementing
  status(identifier: string): RateLimitResult {
    const now = Date.now();
    const entry = this.cache.get(identifier);
    
    if (!entry || entry.resetTime <= now) {
      return {
        success: true,
        limit: this.limit,
        remaining: this.limit,
        reset: now + this.windowMs
      };
    }
    
    return {
      success: entry.count < this.limit,
      limit: this.limit,
      remaining: Math.max(0, this.limit - entry.count),
      reset: entry.resetTime
    };
  }
}

// Create different rate limiters for different use cases
export const ratelimit = new RateLimiter(100, 60 * 1000); // 100 requests per minute
export const strictRateLimit = new RateLimiter(10, 60 * 1000); // 10 requests per minute for sensitive endpoints
export const authRateLimit = new RateLimiter(5, 15 * 60 * 1000); // 5 auth attempts per 15 minutes

// Helper function to get client IP from request
export function getClientIP(request: Request): string {
  // Try various headers that might contain the real IP
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip', // Cloudflare
    'x-forwarded',
    'forwarded-for',
    'forwarded'
  ];

  for (const header of headers) {
    const value = (request as Request & { headers: { get: (name: string) => string | null } }).headers?.get?.(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      const ip = value.split(',')[0]?.trim();
      if (ip && ip !== 'unknown') {
        return ip;
      }
    }
  }

  // Fallback to connection remote address (won't work in serverless)
  return 'unknown';
}
