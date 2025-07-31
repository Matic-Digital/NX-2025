'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Box, Container, Section } from '@/components/global/matic-ds';
import { ContentGridItem } from './ContentGridItem';
import { PostCard } from '@/components/global/PostCard';
import type { ContentGrid } from '@/types/contentful/ContentGrid';

export function ContentGrid(props: ContentGrid) {
  const contentGrid = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: contentGrid?.sys?.id });

  console.log('content grid props', props);
  console.log('content grid items:', contentGrid.itemsCollection?.items);

  const isFullWidthGrid = contentGrid.itemsCollection?.items?.some(
    (item) => 'image' in item && item.image
  );
  return (
    <ErrorBoundary>
      <Section>
        <Container>
          <Box direction="col" gap={12}>
            {/* section heading */}
            <Box cols={{ base: 1, lg: 2 }} gap={12} {...inspectorProps({ fieldId: 'heading' })}>
              {/* overline and title */}
              <Box direction="col" gap={2}>
                {contentGrid.heading.overline && (
                  <p className="uppercase" {...inspectorProps({ fieldId: 'heading.overline' })}>
                    {contentGrid.heading.overline}
                  </p>
                )}
                <h2
                  className="text-headline-lg text-foreground"
                  {...inspectorProps({ fieldId: 'heading.title' })}
                >
                  {contentGrid.heading.title}
                </h2>
                {contentGrid.heading.description && (
                  <p {...inspectorProps({ fieldId: 'heading.description' })}>
                    {contentGrid.heading.description}
                  </p>
                )}
              </Box>

              {/* cta */}
              <Box
                gap={2}
                {...inspectorProps({ fieldId: 'heading' })}
                className="ml-auto items-end"
              >
                {contentGrid.heading.ctaCollection?.items?.map((cta, index) => (
                  <Link
                    key={cta.sys?.id || index}
                    href={cta.internalLink?.slug ?? cta.externalLink ?? '#'}
                    {...(cta.externalLink ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <Button
                      variant={
                        contentGrid.heading.ctaCollection?.items?.length === 1
                          ? 'outline'
                          : index === 0
                            ? 'default'
                            : 'outline'
                      }
                    >
                      {cta.text}
                    </Button>
                  </Link>
                ))}
              </Box>
            </Box>

            {/* items */}
            {(() => {
              // Filter out empty/incomplete items
              const validItems =
                contentGrid.itemsCollection?.items?.filter(
                  (item) => item && (item.title || item.__typename)
                ) || [];

              // Check if all valid items are Posts
              const allItemsArePosts =
                validItems.length > 0 && validItems.every((item) => item.__typename === 'Post');

              return (
                <Box
                  cols={{ base: 1, md: 2, lg: allItemsArePosts ? 4 : isFullWidthGrid ? 1 : 3 }}
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
