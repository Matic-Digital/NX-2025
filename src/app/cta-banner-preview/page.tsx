/**
 * CTA Banner Preview Page
 *
 * This page enables content editors to preview CTA Banner components directly from Contentful's
 * preview environment. It fetches CTA Banner content by ID from the query parameters and
 * renders it within the Contentful Live Preview context, allowing real-time updates as
 * content is edited in Contentful.
 *
 * Key features:
 * - Dynamic fetching of CTA Banner content based on ID query parameter
 * - Integration with Contentful's Live Preview for real-time content updates
 * - Error handling for missing or invalid CTA Banner IDs
 * - Loading states with Suspense for improved user experience
 * - Automatic re-fetching when content changes in Contentful
 * - Full CTA banner display with background images and interactive elements
 *
 * This page is typically accessed from Contentful's entry editor via the preview URL
 * configuration, allowing editors to see their changes immediately without publishing.
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getCtaBannerById } from '@/lib/contentful-api/cta-banner';
import { CtaBanner } from '@/components/CtaBanner';
import { ContentfulLivePreviewProvider } from '@contentful/live-preview/react';
import { Container, Box } from '@/components/global/matic-ds';
import type { CtaBanner as CtaBannerType } from '@/types/contentful';

/**
 * CTA Banner Preview Page
 * This page is used for previewing CTA Banner content from Contentful
 * It fetches the CTA Banner by ID from the query parameters
 */

// Loading component for Suspense fallback
function CtaBannerPreviewLoading() {
  return (
    <Container>
      <Box className="py-12">
        <p>Loading CTA Banner preview...</p>
      </Box>
    </Container>
  );
}

// Inner component that uses useSearchParams
function CtaBannerPreviewContent() {
  const searchParams = useSearchParams();
  const ctaBannerId = searchParams?.get('id') ?? '';
  const [ctaBanner, setCtaBanner] = useState<CtaBannerType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCtaBanner() {
      if (!ctaBannerId) {
        setIsLoading(false);
        setError(new Error('No CTA Banner ID provided'));
        return;
      }

      try {
        setIsLoading(true);
        const fetchedCtaBanner = await getCtaBannerById(ctaBannerId, true);
        console.log('Fetched CTA Banner:', fetchedCtaBanner);
        setCtaBanner(fetchedCtaBanner);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching CTA Banner:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch CTA Banner'));
        setIsLoading(false);
      }
    }

    // Use void operator to explicitly ignore the Promise
    void fetchCtaBanner();
  }, [ctaBannerId]);

  // Content to render based on state
  if (isLoading) {
    return (
      <Container>
        <Box className="py-12">
          <p>Loading CTA Banner preview...</p>
        </Box>
      </Container>
    );
  } else if (error) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold text-red-600">Error</h1>
          <p>Error fetching CTA Banner: {error.message}</p>
          <p className="mt-2 text-sm text-gray-600">ID: {ctaBannerId}</p>
        </Box>
      </Container>
    );
  } else if (!ctaBanner) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold">CTA Banner Not Found</h1>
          <p>No CTA Banner found with ID: {ctaBannerId}</p>
        </Box>
      </Container>
    );
  }

  return (
    <>
      {/* Full CTA Banner component */}
      <CtaBanner {...ctaBanner} />

      {/* Small indicator that this is a preview */}
      <div className="fixed right-4 bottom-4 z-30 rounded bg-blue-100 p-2 text-xs text-blue-800 shadow-md">
        <p>CTA Banner Preview</p>
        <p className="text-xs opacity-75">ID: {ctaBanner.sys.id}</p>
        <p className="text-xs opacity-75">Title: {ctaBanner.title}</p>
      </div>
    </>
  );
}

export default function CtaBannerPreviewPage() {
  return (
    <ContentfulLivePreviewProvider locale="en-US">
      <Suspense fallback={<CtaBannerPreviewLoading />}>
        <CtaBannerPreviewContent />
      </Suspense>
    </ContentfulLivePreviewProvider>
  );
}
