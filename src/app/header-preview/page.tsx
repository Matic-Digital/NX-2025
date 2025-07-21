/**
 * Header Preview Page
 *
 * This page enables content editors to preview Header components directly from Contentful's
 * preview environment. It fetches Header content by name from the query parameters and
 * renders it within the Contentful Live Preview context, allowing real-time updates as
 * content is edited in Contentful.
 *
 * Key features:
 * - Dynamic fetching of Header content based on query parameters
 * - Integration with Contentful's Live Preview for real-time content updates
 * - Error handling for missing or invalid Header names
 * - Loading states with Suspense for improved user experience
 * - Automatic re-fetching when content changes in Contentful
 *
 * This page is typically accessed from Contentful's entry editor via the preview URL
 * configuration, allowing editors to see their changes immediately without publishing.
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getHeaderByName } from '@/lib/api';
import { Header } from '@/components/global/Header';
import { ContentfulLivePreviewProvider } from '@contentful/live-preview/react';
import { Container, Box } from '@/components/global/matic-ds';
import type { Header as HeaderType } from '@/types/contentful';

/**
 * Header Preview Page
 * This page is used for previewing Header content from Contentful
 * It fetches the Header by name from the query parameters
 */

// Loading component for Suspense fallback
function HeaderPreviewLoading() {
  return (
    <Container>
      <Box className="py-12">
        <p>Loading Header preview...</p>
      </Box>
    </Container>
  );
}

// Inner component that uses useSearchParams
function HeaderPreviewContent() {
  const searchParams = useSearchParams();
  const headerName = searchParams?.get('headerName') ?? '';
  const [header, setHeader] = useState<HeaderType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchHeader() {
      if (!headerName) {
        setIsLoading(false);
        setError(new Error('No Header name provided'));
        return;
      }

      try {
        setIsLoading(true);
        const fetchedHeader = await getHeaderByName(headerName, true);
        setHeader(fetchedHeader);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching Header:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch Header'));
        setIsLoading(false);
      }
    }

    // Use void operator to explicitly ignore the Promise
    void fetchHeader();
  }, [headerName]);

  // Content to render based on state
  if (isLoading) {
    return (
      <Container>
        <Box className="py-12">
          <p>Loading Header preview...</p>
        </Box>
      </Container>
    );
  } else if (error) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p>Error fetching Header: {error.message}</p>
        </Box>
      </Container>
    );
  } else if (!header) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-2xl font-bold">Header Not Found</h1>
          <p>No Header found with name: {headerName}</p>
        </Box>
      </Container>
    );
  }

  return (
    <>
      {/* Header is the primary navigation component */}
      <Header {...header} />

      {/* Small indicator that this is a preview - positioned to not interfere with the header */}
      <div className="fixed right-4 bottom-4 rounded bg-blue-100 p-2 text-xs text-blue-800 shadow-md">
        <p>Header Preview: {header.name}</p>
      </div>
    </>
  );
}

export default function HeaderPreviewPage() {
  return (
    <ContentfulLivePreviewProvider locale="en-US">
      <Suspense fallback={<HeaderPreviewLoading />}>
        <HeaderPreviewContent />
      </Suspense>
    </ContentfulLivePreviewProvider>
  );
}
