import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// import { ratelimit, getClientIP } from './rate-limit';

/**
 * Security utilities for input validation and sanitization
 */

// Common XSS patterns to detect and block
const XSS_PATTERNS = [
  // eslint-disable-next-line security/detect-unsafe-regex
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^>]*>/gi,
  /<object\b[^>]*>/gi,
  /<embed\b[^>]*>/gi,
  /<link\b[^>]*>/gi,
  /<meta\b[^>]*>/gi,
  /data:text\/html/gi,
  /vbscript:/gi,
  /expression\s*\(/gi
];

// SQL injection patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
  /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
  /('|(\\')|(;)|(--)|(\s)|(\/\*)|(\*\/))/gi,
  /(\b(SCRIPT|JAVASCRIPT|VBSCRIPT|ONLOAD|ONERROR|ONCLICK)\b)/gi
];

// Path traversal patterns
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//g,
  /\.\.\\/g,
  /%2e%2e%2f/gi,
  /%2e%2e%5c/gi,
  /\.\.%2f/gi,
  /\.\.%5c/gi
];

/**
 * Sanitize string input by removing potentially dangerous content
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  let sanitized = input;
  
  // Remove XSS patterns
  XSS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  // Remove path traversal attempts
  PATH_TRAVERSAL_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  // Encode HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized.trim();
}

/**
 * Validate input against XSS patterns
 */
export function containsXSS(input: string): boolean {
  if (typeof input !== 'string') return false;
  
  return XSS_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Validate input against SQL injection patterns
 */
export function containsSQLInjection(input: string): boolean {
  if (typeof input !== 'string') return false;
  
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Validate input against path traversal patterns
 */
export function containsPathTraversal(input: string): boolean {
  if (typeof input !== 'string') return false;
  
  return PATH_TRAVERSAL_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Comprehensive input validation
 */
export function validateInput(input: string, maxLength = 1000): {
  isValid: boolean;
  errors: string[];
  sanitized: string;
} {
  const errors: string[] = [];
  
  if (typeof input !== 'string') {
    return {
      isValid: false,
      errors: ['Input must be a string'],
      sanitized: ''
    };
  }
  
  // Check length
  if (input.length > maxLength) {
    errors.push(`Input exceeds maximum length of ${maxLength} characters`);
  }
  
  // Check for XSS
  if (containsXSS(input)) {
    errors.push('Input contains potentially malicious script content');
  }
  
  // Check for SQL injection
  if (containsSQLInjection(input)) {
    errors.push('Input contains potentially malicious SQL content');
  }
  
  // Check for path traversal
  if (containsPathTraversal(input)) {
    errors.push('Input contains path traversal attempts');
  }
  
  const sanitized = sanitizeInput(input);
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
}

/**
 * Validate JSON payload
 */
export function validateJSONPayload(payload: unknown, maxSize = 1024 * 1024): {
  isValid: boolean;
  errors: string[];
  sanitizedPayload: unknown;
} {
  const errors: string[] = [];
  
  try {
    const jsonString = JSON.stringify(payload);
    
    // Check size
    if (jsonString.length > maxSize) {
      errors.push(`Payload exceeds maximum size of ${maxSize} bytes`);
    }
    
    // Recursively validate string values
    const sanitizedPayload = sanitizeJSONObject(payload);
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitizedPayload
    };
  } catch {
    return {
      isValid: false,
      errors: ['Invalid JSON payload'],
      sanitizedPayload: null
    };
  }
}

/**
 * Recursively sanitize JSON object
 */
function sanitizeJSONObject(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeJSONObject(item));
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = sanitizeInput(key);
      // eslint-disable-next-line security/detect-object-injection
      sanitized[sanitizedKey] = sanitizeJSONObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Security middleware for API routes
 */
export async function securityMiddleware(
  request: NextRequest,
  options: {
    requireAuth?: boolean;
    rateLimit?: boolean;
    validateInput?: boolean;
    maxPayloadSize?: number;
  } = {}
): Promise<NextResponse | null> {
  const {
    requireAuth = false,
    rateLimit: enableRateLimit = true,
    validateInput: enableInputValidation = true,
    maxPayloadSize = 1024 * 1024 // 1MB default
  } = options;
  
  // Rate limiting - TODO: Implement when rate-limit module is ready
  if (enableRateLimit) {
    // For now, skip rate limiting - will implement after fixing core security issues
    // eslint-disable-next-line no-console
    console.warn('Rate limiting not yet implemented');
  }
  
  // Authentication check
  if (requireAuth) {
    const authHeader = request.headers.get('authorization');
    const secretFromQuery = request.nextUrl.searchParams.get('secret');
    const secretFromHeader = authHeader?.replace('Bearer ', '');
    
    const providedSecret = secretFromQuery ?? secretFromHeader;
    const expectedSecret = process.env.CONTENTFUL_REVALIDATE_SECRET;
    
    if (!expectedSecret || providedSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }
  
  // Input validation for query parameters
  if (enableInputValidation) {
    const url = request.nextUrl;
    
    for (const [key, value] of url.searchParams.entries()) {
      const validation = validateInput(value);
      if (!validation.isValid) {
        return NextResponse.json(
          { 
            error: 'Invalid input detected',
            field: key,
            issues: validation.errors
          },
          { status: 400 }
        );
      }
    }
    
    // Validate request body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const contentLength = request.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > maxPayloadSize) {
          return NextResponse.json(
            { error: 'Payload too large' },
            { status: 413 }
          );
        }
        
        const body = await request.text();
        if (body) {
          let parsedBody: unknown;
          try {
            parsedBody = JSON.parse(body);
          } catch {
            // If it's not JSON, validate as string
            const validation = validateInput(body, maxPayloadSize);
            if (!validation.isValid) {
              return NextResponse.json(
                { 
                  error: 'Invalid request body',
                  issues: validation.errors
                },
                { status: 400 }
              );
            }
          }
          
          if (parsedBody) {
            const validation = validateJSONPayload(parsedBody, maxPayloadSize);
            if (!validation.isValid) {
              return NextResponse.json(
                { 
                  error: 'Invalid JSON payload',
                  issues: validation.errors
                },
                { status: 400 }
              );
            }
          }
        }
      } catch {
        return NextResponse.json(
          { error: 'Failed to validate request body' },
          { status: 400 }
        );
      }
    }
  }
  
  // If all checks pass, return null to continue processing
  return null;
}

/**
 * Secure error response that doesn't leak sensitive information
 */
export function createSecureErrorResponse(
  error: unknown,
  defaultMessage = 'An error occurred'
): NextResponse {
  // In production, don't expose detailed error messages
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  let message = defaultMessage;
  let status = 500;
  
  if (error instanceof Error) {
    if (isDevelopment) {
      message = error.message;
    }
    
    // Check for specific error types
    if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
      status = 401;
      message = 'Unauthorized';
    } else if (error.message.includes('forbidden')) {
      status = 403;
      message = 'Forbidden';
    } else if (error.message.includes('not found')) {
      status = 404;
      message = 'Not found';
    } else if (error.message.includes('validation')) {
      status = 400;
      message = isDevelopment ? error.message : 'Invalid input';
    }
  }
  
  return NextResponse.json(
    { 
      error: message,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}
