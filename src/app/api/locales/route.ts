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
    const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
    const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_MANAGEMENT_TOKEN;

    console.log('Server API - Checking credentials:');
    console.log('Space ID:', spaceId ? 'Present' : 'Missing');
    console.log('Management Token:', accessToken ? 'Present' : 'Missing');

    if (!spaceId || !accessToken) {
      console.error('Missing Contentful credentials');
      console.error('NEXT_PUBLIC_CONTENTFUL_SPACE_ID:', spaceId ? 'Present' : 'Missing');
      console.error('NEXT_PUBLIC_CONTENTFUL_MANAGEMENT_TOKEN:', accessToken ? 'Present' : 'Missing');
      return NextResponse.json({ 
        error: 'Missing Contentful credentials',
        details: {
          spaceId: spaceId ? 'Present' : 'Missing',
          token: accessToken ? 'Present' : 'Missing'
        }
      }, { status: 500 });
    }

    const response = await fetch(
      `https://api.contentful.com/spaces/${spaceId}/locales`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.contentful.management.v1+json',
        },
        cache: 'no-cache',
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch locales from Contentful:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Response body:', errorText);
      return NextResponse.json({ error: 'Failed to fetch locales' }, { status: response.status });
    }

    const data = await response.json() as ContentfulLocalesResponse;
    
    if (!data.items || data.items.length === 0) {
      console.warn('No locales found in Contentful space');
      return NextResponse.json({ error: 'No locales found' }, { status: 404 });
    }

    // Convert Contentful locale format to our format
    const locales = data.items
      .filter(item => item.contentDeliveryApi) // Only include locales available for delivery API
      .map(item => ({
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

    console.log('Fetched locales from Contentful:', locales);
    return NextResponse.json({ locales });

  } catch (error) {
    console.error('Error fetching locales:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Disable caching for this API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;
