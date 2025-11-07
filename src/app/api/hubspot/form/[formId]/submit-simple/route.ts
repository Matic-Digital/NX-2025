import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    
    console.warn('=== SIMPLE SUBMIT TEST ===');
    console.warn('FormId:', formId);
    console.warn('Content-Type:', request.headers.get('content-type'));
    
    // Basic formId validation only
    if (!formId || formId.length > 100) {
      console.warn('Basic formId validation failed');
      return NextResponse.json(
        { error: 'Invalid form ID' },
        { status: 400 }
      );
    }
    
    // Parse form data without strict validation
    let formData;
    try {
      formData = await request.json();
      console.warn('Form data received:', Object.keys(formData));
      console.warn('Form data values:', formData);
    } catch (error) {
      console.warn('JSON parsing failed:', error);
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      );
    }
    
    // Mock successful submission
    const response = NextResponse.json({
      success: true,
      message: 'Form submitted successfully (simple test)',
      formId,
      receivedData: formData
    });
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
    
  } catch (error) {
    console.error('Simple submit error:', error);
    return NextResponse.json(
      { error: 'Submission failed' },
      { status: 500 }
    );
  }
}

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
