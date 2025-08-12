'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { getSolutionById } from '@/lib/contentful-api/solution';
import { SolutionCard } from '@/components/SolutionCard';
import { Container, Box, Main } from '@/components/global/matic-ds';
import AirImage from '@/components/media/AirImage';
import type { Solution } from '@/types/contentful/Solution';

/**
 * Solution Preview Page
 * This page is used for previewing Solution content from Contentful
 * It fetches the Solution by ID from the query parameters
 */

// Loading component for Suspense fallback
function SolutionPreviewLoading() {
  return (
    <Container>
      <Box className="py-12">
        <p>Loading Solution preview...</p>
      </Box>
    </Container>
  );
}

// Inner component that uses useSearchParams
function SolutionPreviewContent() {
  const searchParams = useSearchParams();
  const solutionId = searchParams?.get('id') ?? '';
  const [solutionData, setSolutionData] = useState<Solution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Enable live updates and inspector mode
  const liveSolutionData = useContentfulLiveUpdates(solutionData);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveSolutionData?.sys?.id });

  useEffect(() => {
    async function fetchSolution() {
      if (!solutionId) {
        setIsLoading(false);
        setError(new Error('No Solution ID provided'));
        return;
      }

      try {
        setIsLoading(true);
        const fetchedSolution = await getSolutionById(solutionId, true);
        console.log('Fetched Solution:', fetchedSolution);
        setSolutionData(fetchedSolution);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching Solution:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch Solution'));
        setIsLoading(false);
      }
    }

    void fetchSolution();
  }, [solutionId]);

  // Content to render based on state
  if (isLoading) {
    return (
      <Container>
        <Box className="py-12">
          <p>Loading Solution preview...</p>
        </Box>
      </Container>
    );
  } else if (error) {
    return (
      <Container>
        <Box className="py-12">
          <p className="text-red-500">Error: {error.message}</p>
        </Box>
      </Container>
    );
  } else if (!liveSolutionData) {
    return (
      <Container>
        <Box className="py-12">
          <p>Solution not found</p>
        </Box>
      </Container>
    );
  }

  return (
    <Main>
      <Container>
        <Box direction="col" gap={12} className="py-12">
          {/* Page Header */}
          <div {...inspectorProps({ fieldId: 'title' })}>
            <h1 className="text-headline-lg mb-4 text-center font-bold">
              Solution Preview: {liveSolutionData.title}
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400">
              Live preview of Solution content with Contentful integration
            </p>
          </div>

          {/* SolutionCard Component Display */}
          <div>
            <h2 className="text-headline-sm mb-6 text-center font-semibold">
              SolutionCard Component States
            </h2>

            <Box cols={{ base: 1, md: 2, lg: 3 }} gap={12} className="mx-auto max-w-6xl">
              {/* Active State */}
              <div>
                <h3 className="text-md mb-3 text-center font-medium">Active State</h3>
                <SolutionCard {...liveSolutionData} index={0} />
                <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                  Card is active/hovered - shows background image and expanded content
                </p>
              </div>

              {/* Inactive State */}
              <div>
                <h3 className="text-md mb-3 text-center font-medium">Inactive State</h3>
                <SolutionCard {...liveSolutionData} index={1} />
                <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                  Card is inactive - shows collapsed state with minimal content
                </p>
              </div>
            </Box>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              This shows how SolutionCard components appear on the frontend in both active and
              inactive states
            </p>
          </div>

          {/* Individual Field Displays */}
          <div>
            <h2 className="text-headline-sm mb-6 text-center font-semibold">
              Individual Components
            </h2>

            {/* Card Background Image Display */}
            <div className="mb-8">
              <h3 className="text-md mb-3 font-medium">Card Background Image</h3>
              <div className="mx-auto max-w-md">
                <AirImage
                  {...liveSolutionData.cardBackgroundImage}
                  {...inspectorProps({ fieldId: 'cardBackgroundImage' })}
                  className="h-64 w-full rounded-lg object-cover"
                />
              </div>
            </div>

            {/* Card Heading */}
            <div className="mb-6">
              <h3 className="text-md mb-2 font-medium">Card Heading</h3>
              <p
                className="text-headline-md text-center font-medium"
                {...inspectorProps({ fieldId: 'cardHeading' })}
              >
                {liveSolutionData.cardHeading}
              </p>
            </div>

            {/* Card Subheading */}
            <div className="mb-6">
              <h3 className="text-md mb-2 font-medium">Card Subheading</h3>
              <p
                className="text-body-lg text-center"
                {...inspectorProps({ fieldId: 'cardSubheading' })}
              >
                {liveSolutionData.cardSubheading}
              </p>
            </div>

            {/* Card Title */}
            <div className="mb-6">
              <h3 className="text-md mb-2 font-medium">Card Title</h3>
              <p
                className="text-headline-xs text-center font-medium"
                {...inspectorProps({ fieldId: 'cardTitle' })}
              >
                {liveSolutionData.cardTitle}
              </p>
            </div>

            {/* Card Description */}
            <div className="mb-6">
              <h3 className="text-md mb-2 font-medium">Card Description</h3>
              <p
                className="text-body-xs text-center"
                {...inspectorProps({ fieldId: 'cardDescription' })}
              >
                {liveSolutionData.cardDescription}
              </p>
            </div>

            {/* Slug */}
            <div className="mb-6">
              <h3 className="text-md mb-2 font-medium">Slug</h3>
              <p
                className="text-body-sm rounded bg-gray-100 p-2 text-center font-mono dark:bg-gray-800"
                {...inspectorProps({ fieldId: 'slug' })}
              >
                {liveSolutionData.slug}
              </p>
            </div>

            {/* Title */}
            <div className="mb-6">
              <h3 className="text-md mb-2 font-medium">Title</h3>
              <p
                className="text-headline-sm text-center font-semibold"
                {...inspectorProps({ fieldId: 'title' })}
              >
                {liveSolutionData.title}
              </p>
            </div>
          </div>

          {/* Debug Information */}
          <div className="mt-12 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <h3 className="text-md mb-3 font-medium">Debug Information</h3>
            <div className="space-y-1 text-xs">
              <p>
                <strong>Solution ID:</strong> {liveSolutionData.sys.id}
              </p>
              <p>
                <strong>Live Updates:</strong>{' '}
                {liveSolutionData === solutionData
                  ? 'No changes detected'
                  : 'Live changes detected'}
              </p>
            </div>
          </div>
        </Box>
      </Container>
    </Main>
  );
}

// Main component with Suspense wrapper
export default function SolutionPreviewPage() {
  return (
    <Suspense fallback={<SolutionPreviewLoading />}>
      <SolutionPreviewContent />
    </Suspense>
  );
}
