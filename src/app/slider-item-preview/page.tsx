/**
 * Slider Item Preview Page
 *
 * This page enables content editors to preview Slider Item components directly from Contentful's
 * preview environment. It fetches Slider Item content by ID from the query parameters and
 * renders it within the Contentful Live Preview context, allowing real-time updates as
 * content is edited in Contentful.
 *
 * Key features:
 * - Dynamic fetching of Slider Item content based on ID query parameter
 * - Integration with Contentful's Live Preview for real-time content updates
 * - Error handling for missing or invalid Slider Item IDs
 * - Loading states with Suspense for improved user experience
 * - Automatic re-fetching when content changes in Contentful
 * - Support for SliderItem, Image, and Post types within sliders
 *
 * This page is typically accessed from Contentful's entry editor via the preview URL
 * configuration, allowing editors to see their changes immediately without publishing.
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getSliderItemById } from '@/lib/contentful-api/slider';
import {
  ContentfulLivePreviewProvider,
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { Container, Box, Main } from '@/components/global/matic-ds';
import { AirImage } from '@/components/media/AirImage';
import type { SliderItem, Image, PostSliderItem } from '@/types/contentful';
import { cn } from '@/lib/utils';

type SliderItemType = SliderItem | PostSliderItem | Image;

/**
 * Slider Item Preview Page
 * This page is used for previewing Slider Item content from Contentful
 * It fetches the Slider Item by ID from the query parameters
 */

// Loading component for Suspense fallback
function SliderItemPreviewLoading() {
  return (
    <Container>
      <Box className="py-12">
        <p>Loading Slider Item preview...</p>
      </Box>
    </Container>
  );
}

// Content overlay component for slider items
interface ContentOverlayProps {
  children: React.ReactNode;
}

const ContentOverlay = ({ children }: ContentOverlayProps) => (
  <div className="relative h-full">
    <div
      className="flex h-full w-full max-w-[393px] flex-col justify-end p-10 backdrop-blur-[14px]"
      style={{
        background:
          'linear-gradient(198deg, rgba(8, 8, 15, 0.16) -1.13%, rgba(8, 8, 15, 0.52) 99.2%), linear-gradient(198deg, rgba(8, 8, 15, 0.06) -1.13%, rgba(8, 8, 15, 0.20) 99.2%)'
      }}
    >
      {children}
    </div>
  </div>
);

// Slider Item Card component for preview
interface SliderItemCardProps {
  item: SliderItemType;
}

const SliderItemCard = ({ item }: SliderItemCardProps) => {
  const updatedItem = useContentfulLiveUpdates(item);
  const inspectorProps = useContentfulInspectorMode({ entryId: updatedItem?.sys?.id });

  const baseCardClasses = cn('text-primary-foreground relative h-[669px] w-full max-w-4xl mx-auto');

  // Handle Image type
  if (updatedItem.__typename === 'Image') {
    const imageItem = updatedItem as Image;
    return (
      <div className={baseCardClasses}>
        <AirImage
          link={imageItem.link}
          altText={imageItem.altText}
          className="absolute h-full w-full object-cover"
        />
      </div>
    );
  }

  // Handle SliderItem type
  if (updatedItem.__typename === 'SliderItem') {
    const sliderItem = updatedItem as SliderItem;
    return (
      <div className={baseCardClasses}>
        <AirImage
          link={sliderItem.image?.link}
          altText={sliderItem.image?.altText}
          className="absolute h-full w-full object-cover"
        />
        <ContentOverlay>
          <Box direction="col" gap={5}>
            <Box direction="col" gap={1.5}>
              {sliderItem.heading.overline && (
                <p
                  className="text-body-sm text-white uppercase"
                  {...inspectorProps({ fieldId: 'heading.overline' })}
                >
                  {sliderItem.heading.overline}
                </p>
              )}
              <h2
                className="text-headline-sm leading-tight text-white"
                {...inspectorProps({ fieldId: 'heading.title' })}
              >
                {sliderItem.heading.title}
              </h2>
            </Box>
            {sliderItem.heading.description && (
              <p
                className="text-body-xs letter-spacing-[0.14px] leading-normal text-white"
                {...inspectorProps({ fieldId: 'heading.description' })}
              >
                {sliderItem.heading.description}
              </p>
            )}
          </Box>
        </ContentOverlay>
      </div>
    );
  }

  // Handle Post type
  if (updatedItem.__typename === 'Post') {
    const postItem = updatedItem as PostSliderItem;
    return (
      <div className={baseCardClasses}>
        <AirImage
          link={postItem.mainImage?.link}
          altText={postItem.mainImage?.altText}
          className="absolute h-full w-full rounded-lg object-cover"
        />
        <ContentOverlay>
          <Box direction="col" gap={5}>
            <Box direction="col" gap={1.5}>
              {postItem.categories && (
                <p
                  className="text-body-sm text-white uppercase"
                  {...inspectorProps({ fieldId: 'categories' })}
                >
                  {postItem.categories[0]}
                </p>
              )}
              <h2
                className="text-headline-sm leading-tight text-white"
                {...inspectorProps({ fieldId: 'title' })}
              >
                {postItem.title}
              </h2>
            </Box>
            {postItem.excerpt && (
              <p
                className="text-body-xs letter-spacing-[0.14px] leading-normal text-white"
                {...inspectorProps({ fieldId: 'excerpt' })}
              >
                {postItem.excerpt}
              </p>
            )}
          </Box>
        </ContentOverlay>
      </div>
    );
  }

  // Fallback for unknown types
  return (
    <div className={baseCardClasses}>
      <div className="flex h-full items-center justify-center rounded-lg bg-gray-200">
        <p className="text-gray-600">Unknown slider item type: {updatedItem.__typename}</p>
      </div>
    </div>
  );
};

// Inner component that uses useSearchParams
function SliderItemPreviewContent() {
  const searchParams = useSearchParams();
  const sliderItemId = searchParams?.get('id') ?? '';
  const [sliderItem, setSliderItem] = useState<SliderItemType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Enable live updates and inspector mode
  const liveSliderItem = useContentfulLiveUpdates(sliderItem);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveSliderItem?.sys?.id });

  useEffect(() => {
    async function fetchSliderItem() {
      if (!sliderItemId) {
        setIsLoading(false);
        setError(new Error('No Slider Item ID provided'));
        return;
      }

      try {
        setIsLoading(true);
        const fetchedSliderItem = await getSliderItemById(sliderItemId, true);
        setSliderItem(fetchedSliderItem);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching Slider Item:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch Slider Item'));
        setIsLoading(false);
      }
    }

    // Use void operator to explicitly ignore the Promise
    void fetchSliderItem();
  }, [sliderItemId]);

  // Content to render based on state
  if (isLoading) {
    return (
      <Container>
        <Box className="py-12">
          <p>Loading Slider Item preview...</p>
        </Box>
      </Container>
    );
  } else if (error) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold text-red-600">Error</h1>
          <p>Error fetching Slider Item: {error.message}</p>
          <p className="mt-2 text-sm text-gray-600">ID: {sliderItemId}</p>
        </Box>
      </Container>
    );
  } else if (!sliderItem || !liveSliderItem) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold">Slider Item Not Found</h1>
          <p>No Slider Item found with ID: {sliderItemId}</p>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Main>
        <Container>
          <div className="pt-20 pb-20" {...inspectorProps({ fieldId: 'sliderItem' })}>
            <SliderItemCard item={liveSliderItem} />
          </div>
        </Container>
      </Main>

      {/* Small indicator that this is a preview */}
      <div className="fixed right-4 bottom-4 rounded bg-blue-100 p-2 text-xs text-blue-800 shadow-md">
        <p>Slider Item Preview</p>
        <p className="text-xs opacity-75">ID: {liveSliderItem?.sys.id}</p>
        <p className="text-xs opacity-75">Type: {liveSliderItem?.__typename}</p>
      </div>
    </>
  );
}

export default function SliderItemPreviewPage() {
  return (
    <ContentfulLivePreviewProvider locale="en-US">
      <Suspense fallback={<SliderItemPreviewLoading />}>
        <SliderItemPreviewContent />
      </Suspense>
    </ContentfulLivePreviewProvider>
  );
}
