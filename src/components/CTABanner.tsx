'use client';

import * as React from 'react';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Box, Container } from '@/components/global/matic-ds';
import type { CtaBanner } from '@/types/contentful/CtaBanner';
import Image from 'next/image';

export function CtaBanner(props: CtaBanner) {
  const ctaBanner = useContentfulLiveUpdates(props);
  // Add inspector mode for Contentful editing
  const inspectorProps = useContentfulInspectorMode({ entryId: ctaBanner?.sys?.id });

  return (
    <ErrorBoundary>
      <section className="relative w-full overflow-hidden">
        {/* Background gradient overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              'linear-gradient(to right, rgba(244, 117, 79, 0.9), rgba(124, 58, 150, 0.9))'
          }}
        />

        {/* Background image */}
        <div className="absolute inset-0 z-[-1]">
          <Image
            src="https://air-prod.imgix.net/795b150a-5d81-43d9-8323-d7ee31860e09.jpg?w=1126&h=335&fm=webp&fit=crop&auto=auto"
            alt="Background texture"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>

        <Container className="relative z-10">
          <Box cols={{ base: 1, lg: 2 }} className="items-center py-16">
            <div className="hidden lg:block">{/* Left side space for desktop layout */}</div>
            <Box
              direction="col"
              gap={6}
              className="text-white"
              {...inspectorProps({ fieldId: 'title' })}
            >
              <h1>{ctaBanner.title || 'Contact Us'}</h1>
              <p className="text-lg opacity-90">
                {ctaBanner.description ||
                  'Duis rhoncus, urna elit amet tincidunt commodo, turpis justo ultricies per nisi, nec dapibus augue nibh sed enim. Nam ultricies.'}
              </p>

              <Box wrap={true} gap={4} className="mt-4">
                {ctaBanner.primaryCta && (
                  <Button
                    variant="outline"
                    className="border-white text-white transition-colors hover:bg-white hover:text-gray-800"
                    {...inspectorProps({ fieldId: 'primaryCta' })}
                  >
                    {ctaBanner.primaryCta.text || 'Contact Us'}
                  </Button>
                )}
                {ctaBanner.secondaryCta && (
                  <Button
                    variant="default"
                    className="bg-gray-900 text-white hover:bg-gray-800"
                    {...inspectorProps({ fieldId: 'secondaryCta' })}
                  >
                    {ctaBanner.secondaryCta.text || 'Request a Quote'}
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Container>
      </section>
    </ErrorBoundary>
  );
}
