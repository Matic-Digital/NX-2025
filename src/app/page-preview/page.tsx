/**
 * Page Preview Component
 *
 * This page enables content editors to preview Page components directly from Contentful's
 * preview environment. It fetches Page content by slug from the query parameters and
 * renders it within the Contentful Live Preview context, allowing real-time updates as
 * content is edited in Contentful.
 *
 * Key features:
 * - Server-side rendering with Next.js draft mode for preview content
 * - Dynamic fetching of Page content based on slug parameter
 * - Integration with Contentful's Live Preview for real-time content updates
 * - Error handling for missing or invalid Page slugs
 * - Forced dynamic rendering to ensure preview content is always fresh
 * - Disabled caching to ensure latest draft content is always displayed
 *
 * This page is typically accessed from Contentful's entry editor via the preview URL
 * configuration, allowing editors to see their changes immediately without publishing.
 */

import { draftMode } from 'next/headers';
import ContentfulLivePreviewInitializer from '@/components/global/ContentfulLivePreviewInitializer';
import { getPageBySlug } from '@/lib/contentful-api';
import { PagePreviewContent } from '@/components/preview/PagePreviewContent';

// Force dynamic rendering for this page to ensure live updates work
export const dynamic = 'force-dynamic';

// Disable caching for this page
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Define the props type for the page component
interface PagePreviewPageProps {
  params: Promise<Record<string, string>>;
  searchParams: Promise<{
    slug?: string;
  }>;
}

/**
 * Page Preview Component
 * This page is specifically for previewing Pages with Contentful Live Preview
 */
export default async function PagePreviewPage({ params, searchParams }: PagePreviewPageProps) {
  // Await the params and searchParams Promises (required in Next.js 15)
  await params; // We need to await this even if we don't use it
  const resolvedSearchParams = await searchParams;

  // Get the page slug from the query parameters
  const pageSlug = resolvedSearchParams?.slug ?? '';
  const draftModeData = await draftMode();
  const isDraftMode = draftModeData.isEnabled;

  // Always use preview mode for this page
  const usePreview = true;

  // Fetch the page data
  let pageData = null;
  let error = null;

  try {
    if (pageSlug) {
      console.log('Fetching page with slug:', pageSlug, 'usePreview:', usePreview);
      pageData = await getPageBySlug(pageSlug, usePreview);
      console.log('Page data received:', pageData);
    }
  } catch (err) {
    console.error('Error fetching page:', err);
    error = err instanceof Error ? err.message : 'An unknown error occurred';
  }

  return (
    <>
      {/* Contentful Live Preview Initializer */}
      <ContentfulLivePreviewInitializer />

      {/* Use the client component for preview content */}
      <PagePreviewContent
        pageData={pageData}
        pageSlug={pageSlug}
        error={error}
        isDraftMode={isDraftMode}
      />
    </>
  );
}
