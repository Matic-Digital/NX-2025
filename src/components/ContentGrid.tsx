'use client';

import * as React from 'react';
import { useContentfulLiveUpdates } from '@contentful/live-preview/react';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Box, Container, Section } from '@/components/global/matic-ds';
import { ContentGridItem } from './ContentGridItem';
import { PostCard } from '@/components/global/PostCard';
import { MuxVideo } from '@/components/media/MuxVideo';
import { SectionHeading } from '@/components/SectionHeading';
import type { ContentGrid } from '@/types/contentful/ContentGrid';

export function ContentGrid(props: ContentGrid) {
  const contentGrid = useContentfulLiveUpdates(props);

  console.log('content grid props', props);
  console.log('content grid items:', contentGrid.itemsCollection?.items);

  return (
    <ErrorBoundary>
      <Section>
        <Container>
          <Box direction="col" gap={12}>
            {/* section heading */}
            <SectionHeading {...contentGrid.heading} />

            {/* items */}
            {(() => {
              // Filter out empty/incomplete items
              const validItems =
                contentGrid.itemsCollection?.items?.filter(
                  (item) => item && (item.title || item.__typename)
                ) || [];
              // Check if any valid item has an image
              const isFullWidthGrid = contentGrid.itemsCollection?.items?.some(
                (item) => 'image' in item && item.image
              );

              // Check if all valid items are Posts
              const allItemsArePosts =
                validItems.length > 0 && validItems.every((item) => item.__typename === 'Post');

              // Check if any valid item is a Video
              const isVideo = contentGrid.itemsCollection?.items?.some(
                (item) => 'playbackId' in item && item.playbackId
              );

              return (
                <Box
                  cols={{
                    base: 1,
                    md: 2,
                    lg: isVideo ? 1 : allItemsArePosts ? 4 : isFullWidthGrid ? 1 : 3
                  }}
                  gap={allItemsArePosts ? 5 : 12}
                  wrap={true}
                >
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

                    // Type guard: Check if item is a Post with essential Post structure
                    // Note: PostCard doesn't require author information, so we only check for core fields
                    const isPost =
                      item.__typename === 'Post' && 'slug' in item && 'content' in item;

                    if (isPost) {
                      // Type assertion since we've verified it's a proper Post
                      return <PostCard key={item.sys?.id || index} {...item} />;
                    }

                    const isVideo =
                      item.__typename === 'Video' &&
                      'playbackId' in item &&
                      'id' in item &&
                      'title' in item;

                    if (isVideo) {
                      // Type assertion since we've verified it's a proper Video
                      return <MuxVideo key={item.sys?.id || index} {...item} />;
                    }

                    // Type guard: Check if item is a ContentGridItem with proper ContentGridItem structure
                    const isContentGridItem = 'link' in item && 'description' in item;

                    if (isContentGridItem) {
                      // Type assertion since we've verified it's a proper ContentGridItem
                      return <ContentGridItem key={item.sys?.id || index} {...item} />;
                    }

                    // Fallback: skip unrecognized items
                    return null;
                  })}
                </Box>
              );
            })()}
          </Box>
        </Container>
      </Section>
    </ErrorBoundary>
  );
}
