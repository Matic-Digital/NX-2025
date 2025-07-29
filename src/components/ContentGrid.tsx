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
import type { ContentGrid } from '@/types/contentful/ContentGrid';

export function ContentGrid(props: ContentGrid) {
  const contentGrid = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: contentGrid?.sys?.id });

  console.log('content grid props', props);

  const isFullWidthGrid = contentGrid.itemsCollection?.items?.some((item) => item.image);
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
            <Box cols={{ base: 1, lg: isFullWidthGrid ? 1 : 3 }} gap={12}>
              {contentGrid.itemsCollection?.items?.map((item, index) => {
                // Skip empty/incomplete items
                if (!item || (!item.title && !item.__typename)) {
                  return null;
                }
                
                // Handle Post items - render empty div for now
                if (item.__typename === 'Post') {
                  return <div key={item.sys?.id || index}>Post placeholder</div>;
                }
                
                // Only render ContentGridItem for actual ContentGridItem types
                return <ContentGridItem key={item.sys?.id || index} {...item} />;
              })}
            </Box>
          </Box>
        </Container>
      </Section>
    </ErrorBoundary>
  );
}
