/**
 * Slider Preview Page
 *
 * This page enables content editors to preview Slider components directly from Contentful's
 * preview environment. It fetches Slider content by ID from the query parameters and
 * renders it within the Contentful Live Preview context, allowing real-time updates as
 * content is edited in Contentful.
 *
 * Key features:
 * - Dynamic fetching of Slider content based on ID query parameter
 * - Integration with Contentful's Live Preview for real-time content updates
 * - Error handling for missing or invalid Slider IDs
 * - Loading states with Suspense for improved user experience
 * - Automatic re-fetching when content changes in Contentful
 * - Full slider functionality with carousel navigation and indicators
 *
 * This page is typically accessed from Contentful's entry editor via the preview URL
 * configuration, allowing editors to see their changes immediately without publishing.
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getSliderById } from '@/lib/contentful-api/slider';
import {
  ContentfulLivePreviewProvider,
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { Container, Box, Main } from '@/components/global/matic-ds';
import { Slider } from '@/components/Slider';
import type { Slider as SliderType } from '@/types/contentful';

/**
 * Slider Preview Page
 * This page is used for previewing Slider content from Contentful
 * It fetches the Slider by ID from the query parameters
 */

// Loading component for Suspense fallback
function SliderPreviewLoading() {
  return (
    <Container>
      <Box className="py-12">
        <p>Loading Slider preview...</p>
      </Box>
    </Container>
  );
}

// Slider Preview Component that renders the full slider
interface SliderPreviewComponentProps {
  slider: SliderType;
}

const SliderPreviewComponent = ({ slider }: SliderPreviewComponentProps) => {
  const updatedSlider = useContentfulLiveUpdates(slider);
  const inspectorProps = useContentfulInspectorMode({ entryId: updatedSlider?.sys?.id });

  if (!updatedSlider?.itemsCollection?.items?.length) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold">No Slider Items</h1>
          <p>This slider doesnt have any items to display.</p>
        </Box>
      </Container>
    );
  }

  return (
    <div {...inspectorProps({ fieldId: 'slider' })}>
      <Slider sys={updatedSlider.sys} title={updatedSlider.title} />
    </div>
  );
};

// Inner component that uses useSearchParams
function SliderPreviewContent() {
  const searchParams = useSearchParams();
  const sliderId = searchParams?.get('id') ?? '';
  const [slider, setSlider] = useState<SliderType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Enable live updates and inspector mode
  const liveSlider = useContentfulLiveUpdates(slider);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveSlider?.sys?.id });

  useEffect(() => {
    async function fetchSlider() {
      if (!sliderId) {
        setIsLoading(false);
        setError(new Error('No Slider ID provided'));
        return;
      }

      try {
        setIsLoading(true);
        const fetchedSlider = await getSliderById(sliderId, true);
        setSlider(fetchedSlider);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching Slider:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch Slider'));
        setIsLoading(false);
      }
    }

    // Use void operator to explicitly ignore the Promise
    void fetchSlider();
  }, [sliderId]);

  // Content to render based on state
  if (isLoading) {
    return (
      <Container>
        <Box className="py-12">
          <p>Loading Slider preview...</p>
        </Box>
      </Container>
    );
  } else if (error) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold text-red-600">Error</h1>
          <p>Error fetching Slider: {error.message}</p>
          <p className="mt-2 text-sm text-gray-600">ID: {sliderId}</p>
        </Box>
      </Container>
    );
  } else if (!slider || !liveSlider) {
    return (
      <Container>
        <Box className="py-12">
          <p className="text-gray-600">Slider with ID &apos;{sliderId}&apos; not found</p>
          <p>No Slider found with ID: {sliderId}</p>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Main>
        <div className="pt-20 pb-20" {...inspectorProps({ fieldId: 'slider' })}>
          <SliderPreviewComponent slider={liveSlider} />
        </div>
      </Main>

      {/* Small indicator that this is a preview */}
      <div className="fixed right-4 bottom-4 bg-blue-100 p-2 text-xs text-blue-800 shadow-md">
        <p>Slider Preview</p>
        <p className="text-xs opacity-75">ID: {liveSlider?.sys.id}</p>
        <p className="text-xs opacity-75">
          Items: {liveSlider?.itemsCollection?.items?.length || 0}
        </p>
      </div>
    </>
  );
}

export default function SliderPreviewPage() {
  return (
    <ContentfulLivePreviewProvider locale="en-US">
      <Suspense fallback={<SliderPreviewLoading />}>
        <SliderPreviewContent />
      </Suspense>
    </ContentfulLivePreviewProvider>
  );
}
