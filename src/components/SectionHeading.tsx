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
import type { SectionHeading } from '@/types/contentful/SectionHeading';

export function SectionHeading(props: SectionHeading) {
  const sectionHeading = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: sectionHeading?.sys?.id });

  return (
    <ErrorBoundary>
      <Section>
        <Container>
          <Box className="flex flex-col items-start">
            <Box direction="col" gap={2} {...inspectorProps({ fieldId: 'heading' })}>
              {sectionHeading.overline && (
                <p
                  className="text-body-xs tracking-wider uppercase"
                  {...inspectorProps({ fieldId: 'overline' })}
                >
                  {sectionHeading.overline}
                </p>
              )}
              <h2 className="text-heading-lg" {...inspectorProps({ fieldId: 'title' })}>
                {sectionHeading.title}
              </h2>
              {sectionHeading.description && (
                <p
                  className="text-body-md max-w-prose"
                  {...inspectorProps({ fieldId: 'description' })}
                >
                  {sectionHeading.description}
                </p>
              )}
              {sectionHeading.ctaCollection?.items?.length && (
                <Box className="mt-4 flex gap-4">
                  {sectionHeading.ctaCollection.items.map((cta, index) => (
                    <Button
                      key={cta.sys.id || index}
                      asChild
                      variant={
                        sectionHeading.ctaCollection?.items?.length === 1
                          ? 'outline'
                          : index === 0
                            ? 'default'
                            : 'outline'
                      }
                    >
                      {cta.externalLink ? (
                        <a href={cta.externalLink} target="_blank" rel="noopener noreferrer">
                          {cta.text}
                        </a>
                      ) : cta.internalLink ? (
                        <Link href={`/${cta.internalLink.slug}`}>{cta.text}</Link>
                      ) : (
                        <span>{cta.text}</span>
                      )}
                    </Button>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Container>
      </Section>
    </ErrorBoundary>
  );
}
