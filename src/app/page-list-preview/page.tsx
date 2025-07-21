/**
 * PageList Preview Component
 *
 * This page enables content editors to preview PageList components directly from Contentful's
 * preview environment. It fetches PageList content by slug from the query parameters and
 * renders it within the Contentful Live Preview context, allowing real-time updates as
 * content is edited in Contentful.
 *
 * Key features:
 * - Server-side rendering with Next.js draft mode for preview content
 * - Dynamic fetching of PageList content based on pageListSlug parameter
 * - Integration with Contentful's Live Preview for real-time content updates
 * - Error handling for missing or invalid PageList slugs
 * - Forced dynamic rendering to ensure preview content is always fresh
 * - Disabled caching to ensure latest draft content is always displayed
 *
 * The PageList content type in Contentful contains a collection of related Pages,
 * accessed via the pagesCollection field following Contentful's collection naming convention.
 * This preview page renders both the PageList metadata and its associated Pages.
 */
import { draftMode } from 'next/headers';
import { Box } from '@/components/global/matic-ds';
import ContentfulLivePreviewInitializer from '@/components/global/ContentfulLivePreviewInitializer';
import { getPageListBySlug } from '@/lib/api';
import { PageList } from '@/components/global/PageList';
import { Footer } from '@/components/global/Footer';
import { Hero } from '@/components/global/Hero';
import { PageLayout } from '@/components/layout/PageLayout';

// Force dynamic rendering for this page to ensure live updates work
export const dynamic = 'force-dynamic';

// Disable caching for this page
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Define the props type for the page component
interface PageListPreviewPageProps {
  params: Promise<Record<string, string>>;
  searchParams: Promise<{
    pageListSlug?: string;
  }>;
}

/**
 * PageList Preview Component
 * This page is specifically for previewing PageLists with Contentful Live Preview
 */
export default async function PageListPreviewPage({
  params,
  searchParams
}: PageListPreviewPageProps) {
  // Await the params and searchParams Promises (required in Next.js 15)
  await params; // We need to await this even if we don't use it
  const resolvedSearchParams = await searchParams;

  // Get the page list slug from the query parameters
  const pageListSlug = resolvedSearchParams?.pageListSlug ?? '';
  const draftModeData = await draftMode();
  const isDraftMode = draftModeData.isEnabled;

  // Always use preview mode for this page
  const usePreview = true;

  // Fetch the page list data
  let pageListData = null;
  let error = null;

  try {
    if (pageListSlug) {
      console.log('Fetching page list with slug:', pageListSlug, 'usePreview:', usePreview);
      pageListData = await getPageListBySlug(pageListSlug, usePreview);
      console.log('Page list data received:', pageListData);
    }
  } catch (err) {
    console.error('Error fetching page list:', err);
    error = err instanceof Error ? err.message : 'An unknown error occurred';
  }

  return (
    <Box direction="col" gap={8} className="min-h-screen py-12">
      {/* Preview Status */}
      <Box className="mx-auto max-w-7xl px-4">
        <div className="mb-8 rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.75.75 0 00.736-.686l.057-.75a.75.75 0 00-.75-.813H9A.75.75 0 009 9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800">Page List Preview Mode</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  You are viewing the PageList component in preview mode.{' '}
                  {isDraftMode ? 'Draft mode is enabled.' : 'Draft mode is disabled.'}
                </p>
                {pageListSlug && <p className="mt-1">Page List Slug: {pageListSlug}</p>}
              </div>
            </div>
          </div>
        </div>
      </Box>

      {/* Error Message */}
      {error && (
        <Box className="mx-auto max-w-7xl px-4">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Page List</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </Box>
      )}

      {/* No Page List Slug Provided */}
      {!pageListSlug && !error && (
        <Box className="mx-auto max-w-7xl px-4">
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">No Page List Slug Provided</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Please provide a page list slug in the URL query parameters (e.g.,
                    ?pageListSlug=your-page-list-slug).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Box>
      )}

      {/* Contentful Live Preview Initializer */}
      <ContentfulLivePreviewInitializer />

      {/* PageList Component with Header and Footer */}
      {pageListData ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4">
          <div className="mb-2 text-center text-xs text-gray-500">Page List Preview</div>

          <PageLayout header={pageListData.header} footer={pageListData.footer}>
            <main className="min-h-screen py-12">
              {/* Render any Hero components from pageContentCollection */}
              {pageListData.pageContentCollection?.items?.map((item, index) => {
                if (item.__typename === 'Hero') {
                  return <Hero key={item.sys?.id || `hero-${index}`} {...item} />;
                }
                return null;
              })}

              <div className="mx-auto max-w-7xl px-4">
                {/* Render the PageList component */}
                <PageList {...pageListData} />
              </div>
            </main>

            {/* Render the page-specific footer if available */}
            {pageListData.footer && <Footer footerData={pageListData.footer} />}
          </PageLayout>
        </div>
      ) : (
        <Box className="mx-auto max-w-7xl px-4">
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">No Page List Data Found</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    No page list data was found for slug: {pageListSlug}. Make sure the slug exists
                    in Contentful.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Box>
      )}
    </Box>
  );
}
