import { type NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

import { getMenuItemById } from '@/components/MenuItem/MenuItemApi';
import { getCacheConfig } from '@/lib/cache-tags';

/**
 * Server-side API route for fetching MenuItem data by ID
 * This replaces direct client-side Contentful API calls
 * Keeps environment variables secure on the server
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'MenuItem ID is required' }, { status: 400 });
    }

    // Get preview mode from query params
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    // Get cache configuration for this content type and ID
    const cacheConfig = getCacheConfig('MenuItem', { id });

    // Create cached function with proper tags
    const getCachedMenuItem = unstable_cache(
      async (menuItemId: string, isPreview: boolean) => {
        return await getMenuItemById(menuItemId, isPreview);
      },
      [`menuitem-${id}`],
      {
        tags: cacheConfig.next?.tags || [],
        revalidate: cacheConfig.next?.revalidate || 3600
      }
    );

    // Fetch menu item data using server-side API
    const menuItem = await getCachedMenuItem(id, preview);

    if (!menuItem) {
      return NextResponse.json({ error: 'MenuItem not found' }, { status: 404 });
    }

    // Ensure proper JSON serialization - no HTML content
    return NextResponse.json({ 
      menuItem: JSON.parse(JSON.stringify(menuItem))
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu item data' },
      { status: 500 }
    );
  }
}
