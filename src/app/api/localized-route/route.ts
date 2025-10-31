import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from 'contentful';
import { validateJSONPayload } from '@/lib/security';

// Disable caching for this API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface LocalizedRouteRequest {
  currentPath: string;
  targetLocale: string;
  currentLocale: string;
}

export async function POST(request: NextRequest) {
  try {
    // Validate request body size
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10240) { // 10KB limit
      return NextResponse.json(
        { error: 'Request payload too large' },
        { status: 413 }
      );
    }

    const body = await request.json() as LocalizedRouteRequest;
    
    // Validate the JSON payload
    const payloadValidation = validateJSONPayload(body, 10240);
    if (!payloadValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid request data', issues: payloadValidation.errors },
        { status: 400 }
      );
    }

    const sanitizedBody = payloadValidation.sanitizedPayload as LocalizedRouteRequest;
    const { currentPath, targetLocale, currentLocale } = sanitizedBody;


    // Initialize Contentful client
    const client = createClient({
      space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!,
      accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN!,
    });

    // Extract slug from various path patterns
    let slug = '';
    
    // Handle different URL patterns
    if (currentPath.startsWith('/post/blog/')) {
      // Extract slug from /post/blog/slug-here
      slug = currentPath.replace('/post/blog/', '');
    } else if (currentPath.startsWith('/post/')) {
      // Extract slug from /post/slug-here
      slug = currentPath.replace('/post/', '');
    } else {
      // Clean the current path (remove leading slash)
      slug = currentPath.replace(/^\//, '') || 'home';
    }


    try {
      // Try to find the current content by slug in ANY locale first
      // This is important because the user might be on a localized page
      const allLocales = ['en-US', 'pt-BR', 'es']; // Add your available locales here
      let foundEntry = null;
      let _foundInLocale = null;

      for (const locale of allLocales) {
        
        const entries = await client.getEntries({
          content_type: 'post',
          'fields.slug': slug,
          locale: locale,
          limit: 1,
        });

        if (entries.items.length > 0 && entries.items[0]?.sys?.id) {
          foundEntry = entries.items[0];
          _foundInLocale = locale;
          break;
        }
      }

      if (foundEntry) {
        // Now get the same entry in the target locale
        const localizedEntry = await client.getEntry(foundEntry.sys.id, {
          locale: targetLocale,
        });

        if (localizedEntry && localizedEntry.fields?.slug) {
          const localizedSlug = localizedEntry.fields.slug as string;
          
          // Construct the localized path based on the original path structure
          let localizedPath;
          if (currentPath.startsWith('/post/blog/')) {
            localizedPath = `/post/blog/${localizedSlug}`;
          } else if (currentPath.startsWith('/post/')) {
            localizedPath = `/post/${localizedSlug}`;
          } else {
            localizedPath = `/${localizedSlug}`;
          }
          
          return NextResponse.json({ localizedPath });
        }
      }

      // If not found as post, try other content types that might have slugs
      const contentTypes = ['pageLayout', 'page']; // Add other content types as needed
      
      for (const contentType of contentTypes) {
        try {
          const entries = await client.getEntries({
            content_type: contentType,
            'fields.slug': slug,
            locale: currentLocale,
            limit: 1,
          });

          if (entries.items.length > 0) {
            const entry = entries.items[0];
            
            if (!entry || !entry.sys?.id) {
              continue;
            }
            
            const localizedEntry = await client.getEntry(entry.sys.id, {
              locale: targetLocale,
            });

            if (localizedEntry && localizedEntry.fields?.slug) {
              const localizedSlug = localizedEntry.fields.slug as string;
              const localizedPath = `/${localizedSlug}`;
              
              return NextResponse.json({ localizedPath });
            }
          }
        } catch {
          // Content type not found
        }
      }

      // If no localized version found, return null
      return NextResponse.json({ localizedPath: null });

    } catch {
      return NextResponse.json({ localizedPath: null });
    }

  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
