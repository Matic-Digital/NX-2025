/**
 * Footer Preview Page
 *
 * This page enables content editors to preview Footer components directly from Contentful's
 * preview environment. It fetches Footer content by ID from the query parameters and
 * renders it within the Contentful Live Preview context, allowing real-time updates as
 * content is edited in Contentful.
 *
 * Key features:
 * - Dynamic fetching of Footer content based on query parameters
 * - Integration with Contentful's Live Preview for real-time content updates
 * - Error handling for missing or invalid Footer IDs
 * - Loading states with Suspense for improved user experience
 * - Automatic re-fetching when content changes in Contentful
 *
 * This page is typically accessed from Contentful's entry editor via the preview URL
 * configuration, allowing editors to see their changes immediately without publishing.
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getFooterById } from '@/lib/api';
import { Footer } from '@/components/global/Footer';
import { ContentfulLivePreviewProvider } from '@contentful/live-preview/react';
import { Container, Box } from '@/components/global/matic-ds';
import type { Footer as FooterType } from '@/types/contentful';

/**
 * Footer Preview Page
 * This page is used for previewing footer content from Contentful
 * It fetches the footer by ID from the query parameters
 */

// Loading component for Suspense fallback
function FooterPreviewLoading() {
  return (
    <Container>
      <Box className="py-12">
        <p>Loading Footer preview...</p>
      </Box>
    </Container>
  );
}

// Inner component that uses useSearchParams
function FooterPreviewContent() {
  const searchParams = useSearchParams();
  const footerId = searchParams?.get('footerId') ?? '';
  const [footer, setFooter] = useState<FooterType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchFooter() {
      if (!footerId) {
        setIsLoading(false);
        setError(new Error('No Footer ID provided'));
        return;
      }

      try {
        setIsLoading(true);
        const fetchedFooter = await getFooterById(footerId, true);
        setFooter(fetchedFooter);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching Footer:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch Footer'));
        setIsLoading(false);
      }
    }

    // Use void operator to explicitly ignore the Promise
    void fetchFooter();
  }, [footerId]);

  // Content to render based on state
  if (isLoading) {
    return (
      <Container>
        <Box className="py-12">
          <p>Loading Footer preview...</p>
        </Box>
      </Container>
    );
  } else if (error) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold text-red-600">Error</h1>
          <p>Error fetching Footer: {error.message}</p>
          {!footerId && (
            <div className="mt-4 rounded border border-yellow-400 bg-yellow-50 p-4">
              <p className="text-yellow-800">Please use the format:</p>
              <code className="mt-2 block rounded bg-gray-100 p-2">
                /footer-preview?footerId=YOUR_FOOTER_ID
              </code>
            </div>
          )}
        </Box>
      </Container>
    );
  } else if (!footer) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold">Footer Not Found</h1>
          <p>No Footer found with ID: {footerId}</p>
        </Box>
      </Container>
    );
  }

  return (
    <>
      {/* Footer is the primary footer component */}
      <Footer footerData={footer} />

      <Container className="mt-24">
        <Box className="py-12">
          <h1 className="text-headline-xs mb-4 font-bold">Footer Preview</h1>
          <p className="mb-2">
            <strong>ID:</strong> {footer.sys.id}
          </p>
          <p className="mb-2">
            <strong>Title:</strong> {footer.title}
          </p>
          <div className="mt-8 rounded bg-gray-100 p-4">
            <p className="text-sm text-gray-600">
              This is a preview of the Footer. You can edit it in Contentful and see the changes in
              real-time.
            </p>
          </div>
        </Box>
      </Container>
    </>
  );
}

export default function FooterPreviewPage() {
  return (
    <ContentfulLivePreviewProvider locale="en-US">
      <Suspense fallback={<FooterPreviewLoading />}>
        <FooterPreviewContent />
      </Suspense>
    </ContentfulLivePreviewProvider>
  );
}
