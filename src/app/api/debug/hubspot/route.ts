import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.HUBSPOT_API_KEY;
  
  return NextResponse.json({
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyPrefix: apiKey?.substring(0, 10) || 'none',
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  });
}
