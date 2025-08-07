import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
// import { getPageBySlug } from '@/lib/contentful-api/page';
// import { checkPageBelongsToPageList } from '@/lib/contentful-api/page-list';

/**
 * API route to check if a page belongs to a PageList
 *
 * This route takes a page slug as a query parameter and checks if the page
 * belongs to any PageList. If it does, it returns the PageList slug.
 *
 * @param request - The incoming request with query parameters
 * @returns JSON response with parentSlug if the page belongs to a PageList
 */
export async function GET(request: NextRequest) {
  console.log('API: Checking if page belongs to a PageList', request);
  // // Get the slug from the query parameters
  // const { searchParams } = new URL(request.url);
  // const slug = searchParams.get('slug');

  // // If no slug is provided, return an error
  // if (!slug) {
  //   return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
  // }

  // try {
  //   console.log(`API: Checking if page with slug '${slug}' belongs to a PageList`);

  //   // Get the page by slug
  //   const page = await getPageBySlug(slug, false);

  //   // If no page is found, return null
  //   if (!page) {
  //     console.log(`API: No page found with slug '${slug}'`);
  //     return NextResponse.json({ parentSlug: null });
  //   }

  //   console.log(`API: Found page with ID '${page.sys.id}' and slug '${slug}'`);

  //   // Check if the page belongs to any PageList
  //   const parentPageList = await checkPageBelongsToPageList(page.sys.id, false);

  //   if (parentPageList) {
  //     console.log(`API: Page '${slug}' belongs to PageList '${parentPageList.slug}'`);
  //   } else {
  //     console.log(`API: Page '${slug}' does not belong to any PageList`);
  //   }

  //   // Return the parent PageList slug if found
  //   return NextResponse.json({
  //     parentSlug: parentPageList?.slug ?? null,
  //     pageId: page.sys.id,
  //     pageName: page.title
  //   });
  // } catch (error) {
  //   console.error('Error checking page parent:', error);

  //   // Return a server error
  //   return NextResponse.json({ error: 'Error checking page parent' }, { status: 500 });
  // }
  // Temporarily disabled to fix circular dependency build error
  return NextResponse.json(
    { error: 'API route temporarily disabled due to circular dependency issues' },
    { status: 503 }
  );
}
