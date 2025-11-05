import { NextResponse } from 'next/server';

/**
 * API route to provide Contentful configuration to client-side Live Preview components
 * This allows Live Preview to work with server-side environment variables
 */
export async function GET() {
  try {
    const config = {
      spaceId: process.env.CONTENTFUL_SPACE_ID,
      previewToken: process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN,
      environment: process.env.CONTENTFUL_ENVIRONMENT || 'development',
      serverProvided: true
    };

    // Validate that required config is available
    if (!config.spaceId || !config.previewToken) {
      return NextResponse.json(
        { error: 'Missing required Contentful configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error providing Contentful config:', error);
    return NextResponse.json(
      { error: 'Failed to provide Contentful configuration' },
      { status: 500 }
    );
  }
}
