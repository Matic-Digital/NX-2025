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
  variant?: string; // Optional variant for rendering style
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
  const { cols, direction, gap } = calculateGridConfig(validItems);

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
                const gridContent = (
                  <Box cols={cols} gap={gap} wrap={true}>
                    {validItems.map((item, index) => (
                      <ContentItemRenderer
                        key={item.sys?.id ?? index}
                        item={item}
                        index={index}
                        validItems={validItems}
                        parentPageListSlug={props.parentPageListSlug}
                        currentPath={props.currentPath}
                        variant={props.variant}
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
