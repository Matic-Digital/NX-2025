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
import type { CtaBanner } from '@/types/contentful/CtaBanner';
import Image from 'next/image';

export function CtaBanner(props: CtaBanner) {
  const ctaBanner = useContentfulLiveUpdates(props);
  // Add inspector mode for Contentful editing
  const inspectorProps = useContentfulInspectorMode({ entryId: ctaBanner?.sys?.id });

  return (
    <ErrorBoundary>
      <Section className="relative w-full overflow-hidden">
        {/* Background gradient image */}
        <Image
          src="https://air-prod.imgix.net/d9e20c21-d890-4888-97ae-03880f98fba6.jpg?w=1440&h=335&fm=webp&fit=crop&auto=auto"
          alt="Background Gradient Image"
          fill
          className="object-cover"
          priority
        />

        {/* Background image with fade effect */}
        <div className="absolute inset-0 z-10 [mask-image:linear-gradient(to_right,black_20%,transparent_70%)] [-webkit-mask-image:linear-gradient(to_right,black_20%,transparent_70%)]">
          <Image
            src={ctaBanner.backgroundImage.url}
            alt={ctaBanner.backgroundImage.description}
            fill
            className="object-cover"
            priority
          />
        </div>

        <Container className="relative z-20 h-[335px]">
          <Box cols={{ base: 1, lg: 5 }} className="h-[335px] items-center">
            <Box
              direction="col"
              gap={6}
              className="text-white lg:col-span-2 lg:col-start-4"
              {...inspectorProps({ fieldId: 'title' })}
            >
              <Box direction="col" gap={2}>
                <h2>{ctaBanner.title}</h2>
                <p className="text-body-xs w-md">{ctaBanner.description}</p>
              </Box>

              <Box wrap={true} gap={3}>
                {ctaBanner.primaryCta && (
                  <Link href={ctaBanner.primaryCta.internalLink?.slug ?? ''}>
                    <Button
                      variant="outline"
                      className="transition-colors hover:bg-white hover:text-gray-800"
                      {...inspectorProps({ fieldId: 'primaryCta' })}
                    >
                      {ctaBanner.primaryCta.text}
                    </Button>
                  </Link>
                )}
                {ctaBanner.secondaryCta && (
                  <Button
                    className="bg-gray-900 text-white hover:bg-gray-800"
                    {...inspectorProps({ fieldId: 'secondaryCta' })}
                  >
                    {ctaBanner.secondaryCta.text}
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Container>
      </Section>
    </ErrorBoundary>
  );
}
