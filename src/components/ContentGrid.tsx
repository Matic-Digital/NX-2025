'use client';

import * as React from 'react';
import { useContentfulLiveUpdates } from '@contentful/live-preview/react';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Box, Container, Section } from '@/components/global/matic-ds';
import { ContentGridItem } from './ContentGridItem';
import { PostCard } from '@/components/global/PostCard';
import { Slider } from '@/components/Slider';
import { SolutionCard } from '@/components/SolutionCard';
import { ServiceCard } from '@/components/global/ServiceCard';
import { MuxVideo } from '@/components/media/MuxVideo';
import { SectionHeading } from '@/components/SectionHeading';
import AirImage from '@/components/media/AirImage';
import { ServiceCardProvider } from '@/contexts/ServiceCardContext';
import type { ContentGrid } from '@/types/contentful/ContentGrid';
import type {
  ContentGridItem as ContentGridItemType,
  VideoSys as VideoType,
  Post as PostType,
  Service as ServiceType,
  SliderSys as SliderType,
  SolutionSys as SolutionType
} from '@/types/contentful/';

export function ContentGrid(props: ContentGrid) {
  const contentGrid = useContentfulLiveUpdates(props);

  console.log('content grid props', props);
  console.log('content grid items:', contentGrid.itemsCollection?.items);

  // Filter out empty/incomplete items
  const validItems =
    contentGrid.itemsCollection?.items?.filter((item) => item && (item.title || item.__typename)) ||
    [];

  const allItemsAreSolutions =
    validItems.length > 0 && validItems.every((item) => item.__typename === 'Solution');

  const direction = allItemsAreSolutions ? { base: 'col' as const, xl: 'row' as const } : 'col';
  const gap = allItemsAreSolutions ? { base: 12, xl: 2 } : 12;

  return (
    <ErrorBoundary>
      <div data-theme={props.isDarkMode && 'dark'}>
        <Section className="relative dark:bg-black">
          <Box className="absolute top-0 left-0 h-full w-full">
            <AirImage
              link={contentGrid.backgroundImage?.link}
              altText={contentGrid.backgroundImage?.altText}
              className="h-full w-full object-cover"
            />
          </Box>
          <Container>
            <Box direction={direction} gap={gap} className="relative z-20">
              {/* section heading */}
              <SectionHeading {...contentGrid.heading} isDarkMode={props.isDarkMode} />

              {/* items */}
              {(() => {
                // Check if any valid item has an image
                const isFullWidthGrid = contentGrid.itemsCollection?.items?.some(
                  (item) => 'image' in item && item.image
                );

                // Check if all valid items are Posts
                const allItemsArePosts =
                  validItems.length > 0 && validItems.every((item) => item.__typename === 'Post');

                // Type guard: Check if item is a Video with essential Video structure
                const isVideo = validItems.some((item) => item.__typename === 'Video');

                // Type guard: Check if item is a Slider with essential Slider structure
                const isSlider = validItems.some((item) => item.__typename === 'Slider');

                // Check if there are any service cards to wrap with provider
                const hasServiceCards = validItems.some((item) => item.__typename === 'Service');

                const cols = {
                  base: 1,
                  md: allItemsAreSolutions ? 1 : 2,
                  lg: isVideo
                    ? 1
                    : isSlider
                      ? 1
                      : allItemsArePosts
                        ? 4
                        : isFullWidthGrid
                          ? 1
                          : allItemsAreSolutions
                            ? 3
                            : 3
                };

                const gap = allItemsArePosts ? 5 : allItemsAreSolutions ? { base: 5, xl: 4 } : 12;

                const gridContent = (
                  <Box cols={cols} gap={gap} wrap={true}>
                    {validItems.map((item, index) => {
                      // Debug: Log each item's structure and typename
                      console.log(`ContentGrid item ${index}:`, {
                        typename: item.__typename,
                        hasSlug: 'slug' in item,
                        hasContent: 'content' in item,
                        hasLink: 'link' in item,
                        hasDescription: 'description' in item,
                        item: item
                      });
                      // Type guard: Check if item is a ContentGridItem with proper ContentGridItem structure
                      const isContentGridItem = item.__typename === 'ContentGridItem';

                      if (isContentGridItem) {
                        // Type assertion since we've verified it's a proper ContentGridItem
                        return (
                          <ContentGridItem
                            key={item.sys?.id || index}
                            {...(item as ContentGridItemType)}
                          />
                        );
                      }

                      // Type guard: Check if item is a Post with essential Post structure
                      // Note: PostCard doesn't require author information, so we only check for core fields
                      const isPost = item.__typename === 'Post';

                      if (isPost) {
                        // Type assertion since we've verified it's a proper Post
                        return <PostCard key={item.sys?.id || index} {...(item as PostType)} />;
                      }

                      if (isVideo) {
                        // Type assertion since we've verified it's a proper Video
                        return <MuxVideo key={item.sys?.id || index} {...(item as VideoType)} />;
                      }

                      // Type guard: Check if item is a Solution with essential Solution structure
                      const isSolution = item.__typename === 'Solution';

                      if (isSolution) {
                        // Type assertion since we've verified it's a proper Solution
                        return (
                          <SolutionCard
                            key={item.sys?.id || index}
                            index={index}
                            {...(item as SolutionType)}
                          />
                        );
                      }

                      const isService = item.__typename === 'Service';

                      if (isService) {
                        // Find the first service item index
                        const serviceItems = validItems.filter(
                          (item) => item.__typename === 'Service'
                        );
                        const serviceIndex = serviceItems.findIndex(
                          (serviceItem) => serviceItem.sys?.id === item.sys?.id
                        );
                        const isFirstService = serviceIndex === 0;

                        // Type assertion since we've verified it's a proper Service
                        return (
                          <ServiceCard
                            key={item.sys?.id || index}
                            cardId={item.sys?.id || `service-${index}`}
                            isFirst={isFirstService}
                            {...(item as ServiceType)}
                          />
                        );
                      }

                      const isSlider = item.__typename === 'Slider';

                      if (isSlider) {
                        // Type assertion since we've verified it's a proper Slider
                        return <Slider key={item.sys?.id || index} {...(item as SliderType)} />;
                      }

                      // Fallback: skip unrecognized items
                      return null;
                    })}
                  </Box>
                );

                // Return content wrapped with ServiceCardProvider if service cards are present
                return hasServiceCards ? (
                  <ServiceCardProvider>{gridContent}</ServiceCardProvider>
                ) : (
                  gridContent
                );
              })()}
            </Box>
          </Container>
        </Section>
      </div>
    </ErrorBoundary>
  );
}
