'use client';

import * as React from 'react';
import { useContentfulLiveUpdates } from '@contentful/live-preview/react';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Box, Container, Section } from '@/components/global/matic-ds';
import { SectionHeading } from '@/components/SectionHeading';
import { AirImage } from '@/components/media/AirImage';
import { ServiceCardProvider } from '@/contexts/ServiceCardContext';
import { ContentItemRenderer } from './ContentGrid/ContentItemRenderer';
import {
  calculateGridConfig,
  collectionAnalyzers,
  type ContentGridItemUnion
} from '../lib/component-grid/utils';

import type { ContentGrid as ContentGridType } from '@/types/contentful';

interface ContentGridProps extends ContentGridType {
  parentPageListSlug?: string; // Optional parent PageList slug for nested routing
  currentPath?: string; // Full current path for deeply nested structures
}

export function ContentGrid(props: ContentGridProps) {
  const contentGrid = useContentfulLiveUpdates(props);

  console.log('content grid props', props);
  console.log('content grid items:', contentGrid.itemsCollection?.items);

  // Filter out empty/incomplete items and cast to our union type
  const validItems: ContentGridItemUnion[] =
    contentGrid.itemsCollection?.items?.filter((item) => item && (item.title || item.__typename)) ||
    [];

  // Calculate grid configuration using utilities
  const { cols, direction, gap, useCustomLayout, layoutType } = calculateGridConfig(validItems);

  // Check if there are any service cards to wrap with provider
  const hasServiceCards = collectionAnalyzers.hasServiceCards(validItems);

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
                const gridContent =
                  useCustomLayout && layoutType === 'fourItemAsymmetric' ? (
                    // Custom 4-item staggered grid (3 columns)
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 [&>*]:min-h-[22.5rem]">
                      {/* Top row - items in columns 1 and 2 */}
                      <ContentItemRenderer
                        key={validItems[0]?.sys?.id ?? 0}
                        item={validItems[0]!}
                        index={0}
                        validItems={validItems}
                        parentPageListSlug={props.parentPageListSlug}
                        currentPath={props.currentPath}
                      />
                      <ContentItemRenderer
                        key={validItems[1]?.sys?.id ?? 1}
                        item={validItems[1]!}
                        index={1}
                        validItems={validItems}
                        parentPageListSlug={props.parentPageListSlug}
                        currentPath={props.currentPath}
                      />
                      {/* Empty space in column 3 for top row */}
                      <div className="hidden md:block"></div>

                      {/* Bottom row - empty column 1, items in columns 2 and 3 */}
                      <div className="hidden md:block"></div>
                      <ContentItemRenderer
                        key={validItems[2]?.sys?.id ?? 2}
                        item={validItems[2]!}
                        index={2}
                        validItems={validItems}
                        parentPageListSlug={props.parentPageListSlug}
                        currentPath={props.currentPath}
                      />
                      <ContentItemRenderer
                        key={validItems[3]?.sys?.id ?? 3}
                        item={validItems[3]!}
                        index={3}
                        validItems={validItems}
                        parentPageListSlug={props.parentPageListSlug}
                        currentPath={props.currentPath}
                      />
                    </div>
                  ) : (
                    // Existing uniform grid layout
                    <Box cols={cols} gap={gap} wrap={true}>
                      {validItems.map((item, index) => (
                        <ContentItemRenderer
                          key={item.sys?.id ?? index}
                          item={item}
                          index={index}
                          validItems={validItems}
                          parentPageListSlug={props.parentPageListSlug}
                          currentPath={props.currentPath}
                        />
                      ))}
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
