'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';

import { Button } from '@/components/ui/button';
import { Box } from '@/components/global/matic-ds';
import type { SectionHeading } from '@/types/contentful/SectionHeading';

export function SectionHeading(props: SectionHeading) {
  const sectionHeading = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: sectionHeading?.sys?.id });

  const hasCtaCollection = (props.ctaCollection?.items?.length ?? 0) > 0;

  return (
    <Box
      cols={{ base: 1, md: 2, xl: 3 }}
      gap={hasCtaCollection ? 12 : 0}
      {...inspectorProps({ fieldId: 'heading' })}
    >
      {/* overline and title */}
      <Box direction="col" gap={2} className="col-span-2 max-w-[600px]">
        {sectionHeading.overline && (
          <p className="uppercase" {...inspectorProps({ fieldId: 'heading.overline' })}>
            {sectionHeading.overline}
          </p>
        )}
        <h2
          className="text-headline-lg text-foreground"
          {...inspectorProps({ fieldId: 'heading.title' })}
        >
          {sectionHeading.title}
        </h2>
        {sectionHeading.description && (
          <p {...inspectorProps({ fieldId: 'heading.description' })}>
            {sectionHeading.description}
          </p>
        )}
      </Box>

      {/* cta */}
      <Box
        gap={2}
        {...inspectorProps({ fieldId: 'heading' })}
        className="col-span-1 items-end xl:ml-auto"
      >
        {hasCtaCollection &&
          sectionHeading.ctaCollection?.items?.map((cta, index) => (
            <Link
              key={cta.sys?.id || index}
              href={cta.internalLink?.slug ?? cta.externalLink ?? '#'}
              {...(cta.externalLink ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <Button
                variant={
                  (sectionHeading.ctaCollection?.items?.length ?? 0) === 1
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
  );
}
