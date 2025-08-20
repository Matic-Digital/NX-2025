/**
 * Service Preview Page
 *
 * This page enables content editors to preview Service components directly from Contentful's
 * preview environment. It fetches Service content by ID from the query parameters and
 * renders it within the Contentful Live Preview context, allowing real-time updates as
 * content is edited in Contentful.
 *
 * Key features:
 * - Dynamic fetching of Service content based on ID query parameter
 * - Integration with Contentful's Live Preview for real-time content updates
 * - Visual display of ServiceCard component with actual styling
 * - Detailed field breakdown showing all service properties
 * - Error handling for missing or invalid Service IDs
 * - Loading states with Suspense for improved user experience
 * - Inspector mode for click-to-edit functionality
 *
 * This page is typically accessed from Contentful's entry editor via the preview URL
 * configuration, allowing editors to see their changes immediately without publishing.
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getServiceById } from '@/lib/contentful-api/service';
import { ServiceCard } from '@/components/global/ServiceCard';
import { ServiceCardProvider } from '@/contexts/ServiceCardContext';
import {
  ContentfulLivePreviewProvider,
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { Container, Box } from '@/components/global/matic-ds';
import { AirImage } from '@/components/media/AirImage';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Service as ServiceType } from '@/types/contentful/Service';

// Loading component for Suspense fallback
function ServicePreviewLoading() {
  return (
    <Container>
      <Box className="py-12">
        <p>Loading Service preview...</p>
      </Box>
    </Container>
  );
}

// Inner component that uses useSearchParams
function ServicePreviewContent() {
  const searchParams = useSearchParams();
  const serviceId = searchParams?.get('id') ?? '';
  const [serviceData, setServiceData] = useState<ServiceType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Enable live updates and inspector mode
  const liveServiceData = useContentfulLiveUpdates(serviceData);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveServiceData?.sys?.id });

  useEffect(() => {
    async function fetchService() {
      if (!serviceId) {
        setIsLoading(false);
        setError(new Error('No Service ID provided'));
        return;
      }

      try {
        setIsLoading(true);
        const fetchedService = await getServiceById(serviceId, true);
        console.log('Fetched Service:', fetchedService);
        console.log('Service cardImage:', fetchedService?.cardImage);
        setServiceData(fetchedService);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching Service:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch Service'));
        setIsLoading(false);
      }
    }

    void fetchService();
  }, [serviceId]);

  // Content to render based on state
  if (isLoading) {
    return (
      <Container>
        <Box className="py-12">
          <p>Loading Service preview...</p>
        </Box>
      </Container>
    );
  } else if (error) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold text-red-600">Error</h1>
          <p>Error fetching Service: {error.message}</p>
          <p className="mt-2 text-sm text-gray-600">ID: {serviceId}</p>
        </Box>
      </Container>
    );
  } else if (!serviceData || !liveServiceData) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold">Service Not Found</h1>
          <p>No Service found with ID: {serviceId}</p>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <Box className="py-12" direction="col" gap={12}>
          {/* Service Title */}
          <div className="text-center">
            <h1 className="text-headline-lg mb-4 font-bold">Service Preview</h1>
            <h2 className="text-headline-md text-gray-700 dark:text-gray-300">
              {liveServiceData.title}
            </h2>
          </div>

          {/* ServiceCard Component Display */}
          <div>
            <h2 className="text-headline-sm mb-6 text-center font-semibold">
              ServiceCard Component States
            </h2>

            <ServiceCardProvider>
              <Box cols={{ base: 1, md: 2, lg: 3 }} gap={12} className="mx-auto max-w-6xl">
                {/* Active State */}
                <div>
                  <h3 className="text-md mb-3 text-center font-medium">Active State</h3>
                  <ServiceCard
                    serviceId={liveServiceData.sys.id}
                    cardId={liveServiceData.sys.id}
                    isFirst={true}
                  />
                  <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                    Card is active/hovered - shows background image and expanded content
                  </p>
                </div>

                {/* Inactive State */}
                <div>
                  <h3 className="text-md mb-3 text-center font-medium">Inactive State</h3>
                  <ServiceCard
                    serviceId={liveServiceData.sys.id}
                    cardId={`${liveServiceData.sys.id}-inactive`}
                    isFirst={false}
                  />
                  <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                    Card is inactive - shows collapsed state with transparent background
                  </p>
                </div>
              </Box>
            </ServiceCardProvider>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              This shows how ServiceCard components appear on the frontend in both active and
              inactive states
            </p>
          </div>

          {/* Individual Field Displays */}
          <div>
            <h2 className="text-headline-sm mb-6 text-center font-semibold">
              Individual Components
            </h2>

            {/* Card Image Display */}
            {liveServiceData.cardImage && (
              <div className="mb-8">
                <h3 className="text-md mb-3 text-center font-medium">Card Image</h3>
                <div className="flex justify-center">
                  <div
                    className="h-64 w-64 overflow-hidden rounded-lg shadow-md"
                    {...inspectorProps({ fieldId: 'cardImage' })}
                  >
                    <AirImage
                      {...liveServiceData.cardImage}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Card Title Display */}
            <div className="mb-8 text-center">
              <h3 className="text-md mb-3 font-medium">Card Title</h3>
              <h4
                className="text-headline-md text-foreground"
                {...inspectorProps({ fieldId: 'cardTitle' })}
              >
                {liveServiceData.cardTitle}
              </h4>
            </div>

            {/* Card Tags Display */}
            {liveServiceData.cardTags && liveServiceData.cardTags.length > 0 && (
              <div className="mb-8 text-center">
                <h3 className="text-md mb-3 font-medium">Card Tags</h3>
                <div className="space-y-2" {...inspectorProps({ fieldId: 'cardTags' })}>
                  {liveServiceData.cardTags.map((tag, index) => (
                    <div key={index}>
                      <p className="text-foreground">{tag}</p>
                      {index < (liveServiceData.cardTags?.length ?? 0) - 1 && (
                        <hr className="mx-auto my-2 w-24 border-t border-gray-300" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card Button Display */}
            {liveServiceData.cardButtonText && (
              <div className="mb-8 text-center">
                <h3 className="text-md mb-3 font-medium">Card Button</h3>
                <div {...inspectorProps({ fieldId: 'cardButtonText' })}>
                  <Link href={`/services/${liveServiceData.slug}`}>
                    <Button
                      variant="outlineWhite"
                      className="bg-primary hover:text-primary border-white text-white hover:bg-white"
                    >
                      {liveServiceData.cardButtonText}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Service Metadata */}
          <div className="mx-auto max-w-2xl rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold">Service Details</h3>
            <div className="space-y-2 text-sm">
              <div {...inspectorProps({ fieldId: 'title' })}>
                <span className="font-medium">Title:</span> {liveServiceData.title}
              </div>
              <div {...inspectorProps({ fieldId: 'slug' })}>
                <span className="font-medium">Slug:</span> {liveServiceData.slug}
              </div>
              <div {...inspectorProps({ fieldId: 'cardTitle' })}>
                <span className="font-medium">Card Title:</span>{' '}
                {liveServiceData.cardTitle ?? 'Not set'}
              </div>
              {liveServiceData.cardTags && liveServiceData.cardTags.length > 0 && (
                <div {...inspectorProps({ fieldId: 'cardTags' })}>
                  <span className="font-medium">Card Tags:</span>
                  <ul className="mt-1 ml-4">
                    {liveServiceData.cardTags.map((tag, index) => (
                      <li key={index} className="list-disc">
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div {...inspectorProps({ fieldId: 'cardButtonText' })}>
                <span className="font-medium">Card Button Text:</span>{' '}
                {liveServiceData.cardButtonText ?? 'Not set'}
              </div>
              {liveServiceData.cardImage && (
                <div {...inspectorProps({ fieldId: 'cardImage' })}>
                  <span className="font-medium">Card Image URL:</span>
                  <a
                    href={liveServiceData.cardImage.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 break-all text-blue-600 hover:text-blue-800"
                  >
                    {liveServiceData.cardImage.link}
                  </a>
                </div>
              )}
            </div>
          </div>
        </Box>
      </Container>

      {/* Small indicator that this is a preview */}
      <div className="fixed right-4 bottom-4 z-20 rounded bg-blue-100 p-2 text-xs text-blue-800 shadow-md">
        <p>Service Preview</p>
        <p className="text-xs opacity-75">ID: {liveServiceData.sys.id}</p>
        <p className="text-xs opacity-75">Title: {liveServiceData.title}</p>
      </div>
    </>
  );
}

export default function ServicePreviewPage() {
  return (
    <ContentfulLivePreviewProvider locale="en-US">
      <Suspense fallback={<ServicePreviewLoading />}>
        <ServicePreviewContent />
      </Suspense>
    </ContentfulLivePreviewProvider>
  );
}
