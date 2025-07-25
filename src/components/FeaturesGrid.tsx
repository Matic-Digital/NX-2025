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
import type { FeaturesGrid } from '@/types/contentful/FeaturesGrid';

export function FeaturesGrid(props: FeaturesGrid) {
  const featuresGrid = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: featuresGrid?.sys?.id });

  return (
    <ErrorBoundary>
      <Section>
        <Container>
          <Box direction="col" gap={2}>
            <Box cols={{ base: 1, lg: 2 }} gap={12} {...inspectorProps({ fieldId: 'heading' })}>
              {/* overline and title */}
              <Box direction="col" gap={2}>
                {featuresGrid.heading.overline && (
                  <p className="uppercase" {...inspectorProps({ fieldId: 'heading.overline' })}>
                    {featuresGrid.heading.overline}
                  </p>
                )}
                <h2 className="text-foreground" {...inspectorProps({ fieldId: 'heading.title' })}>
                  {featuresGrid.heading.title}
                </h2>
                {featuresGrid.heading.description && (
                  <p {...inspectorProps({ fieldId: 'heading.description' })}>
                    {featuresGrid.heading.description}
                  </p>
                )}
              </Box>

              {/* cta */}
              <Box
                gap={2}
                {...inspectorProps({ fieldId: 'heading' })}
                className="ml-auto items-end"
              >
                {featuresGrid.heading.ctaCollection?.items?.map((cta, index) => (
                  <Link
                    key={cta.sys?.id || index}
                    href={cta.internalLink?.slug ?? cta.externalLink ?? '#'}
                    {...(cta.externalLink ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <Button
                      variant={
                        featuresGrid.heading.ctaCollection?.items?.length === 1
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

            {/* Feature grid items would go here */}
          </Box>
        </Container>
      </Section>
    </ErrorBoundary>
  );
}
