/**
 * Section Heading Preview Page
 *
 * This page enables content editors to preview Section Heading components directly from Contentful's
 * preview environment. It fetches Section Heading content by ID from the query parameters and
 * renders it within the Contentful Live Preview context, allowing real-time updates as
 * content is edited in Contentful.
 *
 * Key features:
 * - Dynamic fetching of Section Heading content based on ID query parameter
 * - Integration with Contentful's Live Preview for real-time content updates
 * - Error handling for missing or invalid Section Heading IDs
 * - Loading states with Suspense for improved user experience
 * - Automatic re-fetching when content changes in Contentful
 * - Support for both default and banner-hero component types
 *
 * This page is typically accessed from Contentful's entry editor via the preview URL
 * configuration, allowing editors to see their changes immediately without publishing.
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getSectionHeadingById } from '@/lib/contentful-api/section-heading';
import { SectionHeading } from '@/components/SectionHeading';
import { ContentfulLivePreviewProvider } from '@contentful/live-preview/react';
import { Container, Box, Main } from '@/components/global/matic-ds';
import type { SectionHeading as SectionHeadingType } from '@/types/contentful';

/**
 * Section Heading Preview Page
 * This page is used for previewing Section Heading content from Contentful
 * It fetches the Section Heading by ID from the query parameters
 */

// Loading component for Suspense fallback
function SectionHeadingPreviewLoading() {
  return (
    <Container>
      <Box className="py-12">
        <p>Loading Section Heading preview...</p>
      </Box>
    </Container>
  );
}

// Inner component that uses useSearchParams
function SectionHeadingPreviewContent() {
  const searchParams = useSearchParams();
  const sectionHeadingId = searchParams?.get('id') ?? '';
  const [sectionHeading, setSectionHeading] = useState<SectionHeadingType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSectionHeading() {
      if (!sectionHeadingId) {
        setIsLoading(false);
        setError(new Error('No Section Heading ID provided'));
        return;
      }

      try {
        setIsLoading(true);
        const fetchedSectionHeading = await getSectionHeadingById(sectionHeadingId, true);
        setSectionHeading(fetchedSectionHeading);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching Section Heading:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch Section Heading'));
        setIsLoading(false);
      }
    }

    // Use void operator to explicitly ignore the Promise
    void fetchSectionHeading();
  }, [sectionHeadingId]);

  // Content to render based on state
  if (isLoading) {
    return (
      <Container>
        <Box className="py-12">
          <p>Loading Section Heading preview...</p>
        </Box>
      </Container>
    );
  } else if (error) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold text-red-600">Error</h1>
          <p>Error fetching Section Heading: {error.message}</p>
          <p className="text-sm text-gray-600 mt-2">ID: {sectionHeadingId}</p>
        </Box>
      </Container>
    );
  } else if (!sectionHeading) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold">Section Heading Not Found</h1>
          <p>No Section Heading found with ID: {sectionHeadingId}</p>
        </Box>
      </Container>
    );
  }

  return (
    <>
    <Main>
        <Container>
            <div className="pt-40">
                <SectionHeading {...sectionHeading} />
            </div>
        </Container>
    </Main>
      {/* Just the Section Heading component - no containers or styling */}

      {/* Small indicator that this is a preview */}
      <div className="fixed right-4 bottom-4 rounded bg-blue-100 p-2 text-xs text-blue-800 shadow-md">
        <p>Section Heading Preview</p>
        <p className="text-xs opacity-75">ID: {sectionHeading.sys.id}</p>
        {sectionHeading.componentType && (
          <p className="text-xs opacity-75">Type: {sectionHeading.componentType}</p>
        )}
      </div>
    </>
  );
}

export default function SectionHeadingPreviewPage() {
  return (
    <ContentfulLivePreviewProvider locale="en-US">
      <Suspense fallback={<SectionHeadingPreviewLoading />}>
        <SectionHeadingPreviewContent />
      </Suspense>
    </ContentfulLivePreviewProvider>
  );
}
