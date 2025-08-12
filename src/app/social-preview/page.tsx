/**
 * Social Preview Page
 *
 * This page enables content editors to preview Social components directly from Contentful's
 * preview environment. It fetches Social content by ID from the query parameters and
 * renders it within the Contentful Live Preview context, allowing real-time updates as
 * content is edited in Contentful.
 *
 * Key features:
 * - Dynamic fetching of Social content based on ID query parameter
 * - Integration with Contentful's Live Preview for real-time content updates
 * - Error handling for missing or invalid Social IDs
 * - Loading states with Suspense for improved user experience
 * - Automatic re-fetching when content changes in Contentful
 * - Clean display of social media link with icon and metadata
 *
 * This page is typically accessed from Contentful's entry editor via the preview URL
 * configuration, allowing editors to see their changes immediately without publishing.
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getSocialById } from '@/lib/contentful-api/social';
import {
  ContentfulLivePreviewProvider,
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { Container, Box } from '@/components/global/matic-ds';
import { AirImage } from '@/components/media/AirImage';
import Link from 'next/link';
import type { Social as SocialType } from '@/types/contentful';

/**
 * Social Preview Page
 * This page is used for previewing Social content from Contentful
 * It fetches the Social by ID from the query parameters
 */

// Loading component for Suspense fallback
function SocialPreviewLoading() {
  return (
    <Container>
      <Box className="py-12">
        <p>Loading Social preview...</p>
      </Box>
    </Container>
  );
}

// Inner component that uses useSearchParams
function SocialPreviewContent() {
  const searchParams = useSearchParams();
  const socialId = searchParams?.get('id') ?? '';
  const [socialData, setSocialData] = useState<SocialType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Enable live updates and inspector mode
  const liveSocialData = useContentfulLiveUpdates(socialData);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveSocialData?.sys?.id });

  useEffect(() => {
    async function fetchSocial() {
      if (!socialId) {
        setIsLoading(false);
        setError(new Error('No Social ID provided'));
        return;
      }

      try {
        setIsLoading(true);
        const fetchedSocial = await getSocialById(socialId, true);
        console.log('Fetched Social:', fetchedSocial);
        setSocialData(fetchedSocial);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching Social:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch Social'));
        setIsLoading(false);
      }
    }

    // Use void operator to explicitly ignore the Promise
    void fetchSocial();
  }, [socialId]);

  // Content to render based on state
  if (isLoading) {
    return (
      <Container>
        <Box className="py-12">
          <p>Loading Social preview...</p>
        </Box>
      </Container>
    );
  } else if (error) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold text-red-600">Error</h1>
          <p>Error fetching Social: {error.message}</p>
          <p className="mt-2 text-sm text-gray-600">ID: {socialId}</p>
        </Box>
      </Container>
    );
  } else if (!liveSocialData) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold">Social Not Found</h1>
          <p>No Social found with ID: {socialId}</p>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <Box className="py-12" direction="col" gap={8}>
          {/* Social Title */}
          <div className="text-center">
            <h1 className="text-headline-lg mb-4 font-bold">Social Media Preview</h1>
            <h2 className="text-headline-md text-gray-700 dark:text-gray-300">
              {liveSocialData.title}
            </h2>
          </div>

          {/* Main Social Display */}
          <div className="flex justify-center">
            <Link
              href={liveSocialData.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-colors hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600">
                {/* Social Icon */}
                <div className="flex h-16 w-16 items-center justify-center">
                  <AirImage
                    link={liveSocialData.icon.url}
                    altText={liveSocialData.icon.title ?? liveSocialData.title}
                    className="h-full w-full object-contain transition-transform group-hover:scale-110"
                    priority
                  />
                </div>

                {/* Social Title */}
                <h3 className="text-center text-lg font-semibold transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {liveSocialData.title}
                </h3>

                {/* Link Preview */}
                <p className="max-w-xs text-center text-sm break-all text-gray-500 dark:text-gray-400">
                  {liveSocialData.link}
                </p>
              </div>
            </Link>
          </div>

          {/* Different Size Variations */}
          <div className="space-y-6">
            <h2 className="text-headline-sm text-center font-semibold">Size Variations</h2>

            {/* Large Size */}
            <div className="text-center">
              <h3 className="text-md mb-3 font-medium">Large (64px)</h3>
              <Link
                href={liveSocialData.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-block"
              >
                <div className="h-16 w-16 transition-transform hover:scale-110">
                  <AirImage
                    link={liveSocialData.icon.url}
                    altText={liveSocialData.icon.title ?? liveSocialData.title}
                    className="h-full w-full object-contain"
                  />
                </div>
              </Link>
            </div>

            {/* Medium Size */}
            <div className="text-center">
              <h3 className="text-md mb-3 font-medium">Medium (48px)</h3>
              <Link
                href={liveSocialData.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-block"
              >
                <div className="h-12 w-12 transition-transform hover:scale-110">
                  <AirImage
                    link={liveSocialData.icon.url}
                    altText={liveSocialData.icon.title ?? liveSocialData.title}
                    className="h-full w-full object-contain"
                  />
                </div>
              </Link>
            </div>

            {/* Small Size */}
            <div className="text-center">
              <h3 className="text-md mb-3 font-medium">Small (32px)</h3>
              <Link
                href={liveSocialData.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-block"
              >
                <div className="h-8 w-8 transition-transform hover:scale-110">
                  <AirImage
                    link={liveSocialData.icon.url}
                    altText={liveSocialData.icon.title ?? liveSocialData.title}
                    className="h-full w-full object-contain"
                  />
                </div>
              </Link>
            </div>
          </div>

          {/* Social Metadata */}
          <div className="mx-auto max-w-2xl rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold">Social Details</h3>
            <div className="space-y-2 text-sm">
              <div {...inspectorProps({ fieldId: 'title' })}>
                <span className="font-medium">Title:</span> {liveSocialData.title}
              </div>
              <div {...inspectorProps({ fieldId: 'link' })}>
                <span className="font-medium">Link:</span>
                <a
                  href={liveSocialData.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 break-all text-blue-600 hover:text-blue-800"
                >
                  {liveSocialData.link}
                </a>
              </div>
              <div {...inspectorProps({ fieldId: 'icon' })}>
                <span className="font-medium">Icon URL:</span> {liveSocialData.icon.url}
              </div>
              {liveSocialData.icon.title && (
                <div>
                  <span className="font-medium">Icon Title:</span>{' '}
                  {liveSocialData.icon.title ?? 'No title'}
                </div>
              )}
              {liveSocialData.icon.width && liveSocialData.icon.height && (
                <div>
                  <span className="font-medium">Icon Dimensions:</span> {liveSocialData.icon.width}{' '}
                  × {liveSocialData.icon.height}px
                </div>
              )}
            </div>
          </div>
        </Box>
      </Container>

      {/* Small indicator that this is a preview */}
      <div className="fixed right-4 bottom-4 z-20 rounded bg-blue-100 p-2 text-xs text-blue-800 shadow-md">
        <p>Social Preview</p>
        <p className="text-xs opacity-75">ID: {liveSocialData.sys.id}</p>
        <p className="mt-4 text-center">Social: {liveSocialData.title}</p>
      </div>
    </>
  );
}

export default function SocialPreviewPage() {
  return (
    <ContentfulLivePreviewProvider locale="en-US">
      <Suspense fallback={<SocialPreviewLoading />}>
        <SocialPreviewContent />
      </Suspense>
    </ContentfulLivePreviewProvider>
  );
}
