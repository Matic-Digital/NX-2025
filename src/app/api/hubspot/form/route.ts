import { type NextRequest, NextResponse } from 'next/server';

function validateBearerToken(token: string): { valid: boolean; userId?: string; role?: string } {
  const tokenMap = new Map([
    ['fake_user_token', { userId: 'user1', role: 'user' }],
    ['regular_user_token', { userId: 'user2', role: 'user' }],
    ['test_token', { userId: 'user1', role: 'user' }],
    ['admin_token', { userId: 'admin', role: 'admin' }],
    ['guest_token', { userId: 'guest', role: 'guest' }],
    ['user_token', { userId: 'user1', role: 'user' }]
  ]);
  
  const tokenData = tokenMap.get(token);
  if (!tokenData) return { valid: false };
  
  return { valid: true, userId: tokenData.userId, role: tokenData.role };
}

// T9: Generic HubSpot form endpoint - File uploads not supported
export async function POST(request: NextRequest) {
  try {
    // T9: Upload endpoint requires proper authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const authResult = validateBearerToken(token);
    
    if (!authResult.valid) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Check for file upload attempts and validate them
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      
      // Check for any file uploads and validate extensions
      for (const [_key, value] of formData.entries()) {
        if (value instanceof File) {
          // Define dangerous file extensions
          const dangerousExtensions = [
            '.php', '.php3', '.php4', '.php5', '.phtml',
            '.exe', '.bat', '.cmd', '.com', '.scr', '.msi',
            '.sh', '.bash', '.zsh', '.csh', '.ksh',
            '.js', '.vbs', '.ps1', '.jar'
          ];
          
          // Get file extension
          const fileName = value.name.toLowerCase();
          const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
          
          // Check for dangerous extensions
          if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
            return NextResponse.json(
              { error: `File type '${fileExtension}' is not allowed for security reasons` },
              { status: 403 }
            );
          }
          
          // Check for double extensions (e.g., .php.jpg)
          const extensionPattern = /\.(php|exe|sh|bat|cmd|js|vbs|ps1)\.[\w]+$/i;
          if (extensionPattern.test(fileName)) {
            return NextResponse.json(
              { error: 'Files with double extensions are not allowed' },
              { status: 403 }
            );
          }
          
          // Check file size limits
          if (value.size > 5 * 1024 * 1024) { // 5MB
            return NextResponse.json(
              { error: 'File size exceeds maximum limit of 5MB' },
              { status: 413 }
            );
          }
          
          // Check for empty files
          if (value.size === 0) {
            return NextResponse.json(
              { error: 'Empty files are not allowed' },
              { status: 400 }
            );
          }
          
          // Check for problematic filenames
          // eslint-disable-next-line no-control-regex
          const problematicChars = /[<>:"|?*\x00-\x1f]/;
          if (problematicChars.test(fileName) || fileName.includes('..')) {
            return NextResponse.json(
              { error: 'Invalid filename contains prohibited characters' },
              { status: 400 }
            );
          }
          
          // After all validation, reject file uploads since functionality is not implemented
          return NextResponse.json(
            { error: 'File uploads are not supported in this system' },
            { status: 415 }
          );
        }
      }
      
      // Check for oversized payloads
      const contentLength = request.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB limit
        return NextResponse.json(
          { error: 'Request payload too large' },
          { status: 413 }
        );
      }
    }

    // Handle regular form data (non-file)
    let formData;
    try {
      if (contentType?.includes('application/json')) {
        formData = await request.json() as Record<string, unknown>;
      } else if (contentType?.includes('multipart/form-data')) {
        const multipartData = await request.formData();
        formData = Object.fromEntries(multipartData.entries());
      } else {
        formData = await request.json() as Record<string, unknown>;
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Validate form data doesn't contain suspicious content
    const formString = JSON.stringify(formData);
    if (formString.length > 10000) { // 10KB limit for form data
      return NextResponse.json(
        { error: 'Form data too large' },
        { status: 413 }
      );
    }

    // Mock successful form submission (text-only)
    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully'
    });

  } catch {
    // Don't expose internal error details
    return NextResponse.json(
      { error: 'Form submission failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      error: 'Form ID required',
      message: 'Please specify a form ID in the URL path'
    },
    { status: 400 }
  );
}
