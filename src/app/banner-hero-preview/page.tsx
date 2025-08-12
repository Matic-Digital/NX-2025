/**
 * Banner Hero Preview Page
 *
 * This page enables content editors to preview Banner Hero components directly from Contentful's
 * preview environment. It fetches Banner Hero content by ID from the query parameters and
 * renders it within the Contentful Live Preview context, allowing real-time updates as
 * content is edited in Contentful.
 *
 * Key features:
 * - Dynamic fetching of Banner Hero content based on ID query parameter
 * - Integration with Contentful's Live Preview for real-time content updates
 * - Error handling for missing or invalid Banner Hero IDs
 * - Loading states with Suspense for improved user experience
 * - Automatic re-fetching when content changes in Contentful
 * - Full-screen banner hero display with background image and section heading
 *
 * This page is typically accessed from Contentful's entry editor via the preview URL
 * configuration, allowing editors to see their changes immediately without publishing.
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getBannerHero } from '@/lib/contentful-api/banner-hero';
import { BannerHero } from '@/components/BannerHero';
import { ContentfulLivePreviewProvider } from '@contentful/live-preview/react';
import { Container, Box } from '@/components/global/matic-ds';
import type { BannerHero as BannerHeroType } from '@/types/contentful';

/**
 * Banner Hero Preview Page
 * This page is used for previewing Banner Hero content from Contentful
 * It fetches the Banner Hero by ID from the query parameters
 */

// Loading component for Suspense fallback
function BannerHeroPreviewLoading() {
  return (
    <Container>
      <Box className="py-12">
        <p>Loading Banner Hero preview...</p>
      </Box>
    </Container>
  );
}

// Inner component that uses useSearchParams
function BannerHeroPreviewContent() {
  const searchParams = useSearchParams();
  const bannerHeroId = searchParams?.get('id') ?? '';
  const [bannerHero, setBannerHero] = useState<BannerHeroType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchBannerHero() {
      if (!bannerHeroId) {
        setIsLoading(false);
        setError(new Error('No Banner Hero ID provided'));
        return;
      }

      try {
        setIsLoading(true);
        const fetchedBannerHero = await getBannerHero(bannerHeroId, true);
        console.log('Fetched Banner Hero:', fetchedBannerHero);
        console.log('Banner Hero heading:', fetchedBannerHero?.heading);
        setBannerHero(fetchedBannerHero);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching Banner Hero:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch Banner Hero'));
        setIsLoading(false);
      }
    }

    // Use void operator to explicitly ignore the Promise
    void fetchBannerHero();
  }, [bannerHeroId]);

  // Content to render based on state
  if (isLoading) {
    return (
      <Container>
        <Box className="py-12">
          <p>Loading Banner Hero preview...</p>
        </Box>
      </Container>
    );
  } else if (error) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold text-red-600">Error</h1>
          <p>Error fetching Banner Hero: {error.message}</p>
          <p className="text-sm text-gray-600 mt-2">ID: {bannerHeroId}</p>
        </Box>
      </Container>
    );
  } else if (!bannerHero) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold">Banner Hero Not Found</h1>
          <p>No Banner Hero found with ID: {bannerHeroId}</p>
        </Box>
      </Container>
    );
  }

  return (
    <>
      {/* Full-screen Banner Hero component */}
      <BannerHero {...bannerHero} />

      {/* Small indicator that this is a preview */}
      <div className="fixed right-4 bottom-4 rounded bg-blue-100 p-2 text-xs text-blue-800 shadow-md z-20">
        <p>Banner Hero Preview</p>
        <p className="text-xs opacity-75">ID: {bannerHero.sys.id}</p>
        <p className="text-xs opacity-75">Title: {bannerHero.title}</p>
      </div>
    </>
  );
}

export default function BannerHeroPreviewPage() {
  return (
    <ContentfulLivePreviewProvider locale="en-US">
      <Suspense fallback={<BannerHeroPreviewLoading />}>
        <BannerHeroPreviewContent />
      </Suspense>
    </ContentfulLivePreviewProvider>
  );
}