import { NextResponse } from 'next/server';

interface ContentfulLocaleResponse {
  sys: {
    id: string;
    type: string;
    version: number;
  };
  name: string;
  code: string;
  default: boolean;
  contentManagementApi: boolean;
  contentDeliveryApi: boolean;
  optional: boolean;
}

interface ContentfulLocalesResponse {
  sys: {
    type: string;
  };
  total: number;
  skip: number;
  limit: number;
  items: ContentfulLocaleResponse[];
}

export async function GET() {
  try {
    const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
    const CONTENTFUL_MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

    if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_MANAGEMENT_TOKEN) {
      // Return mock data for testing when credentials are not configured
      const mockLocales = [
        { code: 'en-US', name: 'English (United States)', default: true },
        { code: 'es', name: 'Spanish', default: false },
        { code: 'fr', name: 'French', default: false },
        { code: 'de', name: 'German', default: false }
      ];
      
      return NextResponse.json({ 
        locales: mockLocales,
        source: 'mock' 
      });
    }

    const response = await fetch(`https://api.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/locales`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${CONTENTFUL_MANAGEMENT_TOKEN}`,
        'Content-Type': 'application/vnd.contentful.management.v1+json'
      },
      cache: 'no-cache'
    });

    if (!response.ok) {
      const _errorText = await response.text();
      return NextResponse.json({ error: 'Failed to fetch locales' }, { status: response.status });
    }

    const data = (await response.json()) as ContentfulLocalesResponse;

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'No locales found' }, { status: 404 });
    }

    // Convert Contentful locale format to our format
    const locales = data.items
      .filter((item) => item.contentDeliveryApi) // Only include locales available for delivery API
      .map((item) => ({
        code: item.code,
        name: item.name,
        default: item.default
      }))
      .sort((a, b) => {
        // Prioritize English locales first, then default locale, then alphabetically
        const isAEnglish = a.code.startsWith('en');
        const isBEnglish = b.code.startsWith('en');

        if (isAEnglish && !isBEnglish) return -1;
        if (!isAEnglish && isBEnglish) return 1;

        // If both or neither are English, sort by default status
        if (a.default && !b.default) return -1;
        if (!a.default && b.default) return 1;

        // Finally sort alphabetically
        return a.name.localeCompare(b.name);
      });

    return NextResponse.json({ locales });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Disable caching for this API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;
