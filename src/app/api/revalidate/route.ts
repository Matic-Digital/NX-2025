import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

const REVALIDATE_SECRET = process.env.CONTENTFUL_REVALIDATE_SECRET;

interface ContentfulWebhookPayload {
  sys: {
    id: string;
    type: string;
    contentType?: {
      sys: {
        id: string;
      };
    };
  };
  fields?: {
    slug?: {
      'en-US': string;
    };
    title?: {
      'en-US': string;
    };
  };
}

interface RevalidationRequest {
  secret?: string;
  contentType?: string;
  slug?: string;
  entryId?: string;
  action?: 'publish' | 'unpublish' | 'delete';
}

export async function POST(request: NextRequest) {
  try {
    // Enhanced security validation
    const authHeader = request.headers.get('authorization');
    const secretFromQuery = request.nextUrl.searchParams.get('secret');
    
    // Handle both "Bearer token" and direct token formats
    const secretFromHeader = authHeader?.startsWith('Bearer ') 
      ? authHeader.replace('Bearer ', '')
      : authHeader;
    
    const providedSecret = secretFromQuery ?? secretFromHeader;
    
    // Validate secret exists and matches
    if (!REVALIDATE_SECRET) {
       
      console.error('❌ CONTENTFUL_REVALIDATE_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    if (!providedSecret || providedSecret !== REVALIDATE_SECRET) {
       
      console.error('❌ Invalid revalidation attempt');
      return NextResponse.json(
        { message: 'Unauthorized', revalidated: false },
        { status: 401 }
      );
    }
    
    // Strict Content-Type validation for security
    const requestContentType = request.headers.get('content-type');
    
    // Allow JSON content types from known webhook providers
    if (requestContentType && 
        !requestContentType.includes('application/json') && 
        !requestContentType.includes('application/vnd.contentful.management.v1+json')) {
      console.error('❌ Invalid Content-Type:', requestContentType);
      return NextResponse.json(
        { error: 'Content-Type must be application/json or application/vnd.contentful.management.v1+json' },
        { status: 400 }
      );
    }

    let body: unknown = {};
    
    try {
      // Only parse JSON - no other formats for security
      body = await request.json();
    } catch (_error) {
      // If no body or invalid JSON, use empty object but log the attempt
      console.warn('⚠️ Could not parse JSON body, using empty object. This may be a manual trigger.');
      body = {};
    }
    // eslint-disable-next-line no-console
    console.log('🔄 Revalidation request received:', {
      contentType: (body as ContentfulWebhookPayload).sys?.contentType?.sys?.id,
      entryId: (body as ContentfulWebhookPayload).sys?.id,
      action: (body as ContentfulWebhookPayload).sys?.type
    });

    // Handle Contentful webhook payload
    const payload = body as ContentfulWebhookPayload;
    const contentType = payload.sys?.contentType?.sys?.id;
    const entryId = payload.sys?.id;
    const slug = payload.fields?.slug?.['en-US'];
    const action = payload.sys?.type;

    // Also handle direct API calls with query parameters
    const queryParams: RevalidationRequest = {
      contentType: request.nextUrl.searchParams.get('contentType') ?? contentType,
      slug: request.nextUrl.searchParams.get('slug') ?? slug,
      entryId: request.nextUrl.searchParams.get('entryId') ?? entryId,
      action: (request.nextUrl.searchParams.get('action') as 'publish' | 'unpublish' | 'delete') ?? 
              (action === 'Entry' ? 'publish' : action as 'publish' | 'unpublish' | 'delete')
    };

    const revalidatedPaths: string[] = [];
    const revalidatedTags: string[] = [];

    // Revalidate based on content type
    if (queryParams.contentType && queryParams.slug) {
      const pathsToRevalidate = await getPathsToRevalidate(
        queryParams.contentType,
        queryParams.slug,
        queryParams.entryId
      );

      for (const path of pathsToRevalidate) {
        try {
          revalidatePath(path);
          revalidatedPaths.push(path);
          // eslint-disable-next-line no-console
          console.log(`✅ Revalidated path: ${path}`);
        } catch (error) {
           
          console.error(`❌ Failed to revalidate path ${path}:`, error);
        }
      }
    }

    // Revalidate by tags for broader cache invalidation
    const tagsToRevalidate = getTagsToRevalidate(queryParams.contentType, queryParams.entryId);
    for (const tag of tagsToRevalidate) {
      try {
        revalidateTag(tag);
        revalidatedTags.push(tag);
        // eslint-disable-next-line no-console
        console.log(`✅ Revalidated tag: ${tag}`);
      } catch (error) {
         
        console.error(`❌ Failed to revalidate tag ${tag}:`, error);
      }
    }

    // Always revalidate the home page for critical content changes
    if (['Page', 'PageList', 'Header', 'Footer'].includes(queryParams.contentType ?? '')) {
      try {
        revalidatePath('/');
        revalidatedPaths.push('/');
        // eslint-disable-next-line no-console
        console.log('✅ Revalidated home page');
      } catch (error) {
         
        console.error('❌ Failed to revalidate home page:', error);
      }
    }

    const response = {
      revalidated: true,
      paths: revalidatedPaths,
      tags: revalidatedTags,
      contentType: queryParams.contentType,
      slug: queryParams.slug,
      action: queryParams.action,
      timestamp: new Date().toISOString()
    };

    // eslint-disable-next-line no-console
    console.log('🎉 Revalidation completed:', response);
    return NextResponse.json(response);

  } catch (error) {
     
    console.error('❌ Revalidation error:', error);
    return NextResponse.json(
      { 
        message: 'Error revalidating', 
        error: error instanceof Error ? error.message : 'Unknown error',
        revalidated: false 
      },
      { status: 500 }
    );
  }
}

/**
 * Determine which paths need to be revalidated based on content type and slug
 */
async function getPathsToRevalidate(
  contentType: string,
  slug: string,
  _entryId?: string
): Promise<string[]> {
  const paths: string[] = [];

  switch (contentType) {
    case 'Page':
      // Revalidate the page itself and any nested paths
      paths.push(`/${slug}`);
      // Also revalidate potential nested paths (your dynamic routing handles this)
      paths.push(`/[...segments]`);
      break;

    case 'PageList':
      // Revalidate the PageList and all potential nested content
      paths.push(`/${slug}`);
      paths.push(`/[...segments]`);
      break;

    case 'Product':
      // Products can be nested under PageLists (e.g., /products/trackers/nx-horizon)
      paths.push(`/${slug}`);
      paths.push(`/[...segments]`);
      break;

    case 'Service':
      // Services can be nested under PageLists
      paths.push(`/${slug}`);
      paths.push(`/[...segments]`);
      break;

    case 'Solution':
      // Solutions can be nested under PageLists
      paths.push(`/${slug}`);
      paths.push(`/[...segments]`);
      break;

    case 'Post':
      // Posts have their own routing structure
      paths.push(`/post/[category]/${slug}`);
      paths.push(`/[...segments]`);
      break;

    case 'Header':
    case 'Footer':
      // Global components - revalidate all pages
      paths.push('/');
      paths.push('/[...segments]');
      break;

    default:
      // For component updates, revalidate the catch-all route
      paths.push('/[...segments]');
      break;
  }

  return paths;
}

/**
 * Get cache tags to revalidate for broader cache invalidation
 */
function getTagsToRevalidate(contentType?: string, entryId?: string): string[] {
  const tags: string[] = [];

  if (contentType) {
    tags.push(`contentType:${contentType}`);
  }

  if (entryId) {
    tags.push(`entry:${entryId}`);
  }

  // Global tags for critical content
  if (['Header', 'Footer', 'PageLayout'].includes(contentType ?? '')) {
    tags.push('global-layout');
  }

  return tags;
}

// Also support GET requests for manual testing
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const path = request.nextUrl.searchParams.get('path') ?? '/';

  if (!REVALIDATE_SECRET || secret !== REVALIDATE_SECRET) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    revalidatePath(path);
    return NextResponse.json({
      revalidated: true,
      path,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        message: 'Error revalidating',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
