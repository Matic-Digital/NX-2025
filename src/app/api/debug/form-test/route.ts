import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.warn('=== DEBUG FORM TEST ===');
    console.warn('Headers:', Object.fromEntries(request.headers.entries()));
    
    const body = await request.text();
    console.warn('Raw body:', body);
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
      console.warn('Parsed body:', parsedBody);
    } catch (e) {
      console.warn('JSON parse error:', e);
    }
    
    return NextResponse.json({
      success: true,
      receivedHeaders: Object.fromEntries(request.headers.entries()),
      receivedBody: body,
      parsedBody: parsedBody || null
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 });
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
