'use client';

import React from 'react';
import { cn } from '@/lib/utils';

import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Box, Container, Section } from '@/components/global/matic-ds';

interface ImageBetweenWrapperProps {
  contentTop?: React.ReactNode;
  asset?: React.ReactNode;
  contentBottom?: React.ReactNode;
  className?: string;
  // Optional styling props
  darkSectionClassName?: string;
  lightSectionClassName?: string;
  assetClassName?: string;
}

/**
 * ImageBetweenWrapper component
 * 
 * A flexible wrapper that follows the ImageBetween layout pattern but accepts
 * custom TSX content for contentTop, asset, and contentBottom sections.
 */
export function ImageBetweenWrapper({
  contentTop,
  asset,
  contentBottom,
  className,
  darkSectionClassName,
  lightSectionClassName,
  assetClassName
}: ImageBetweenWrapperProps) {
  return (
    <ErrorBoundary>
      <div className={cn('relative', className)}>
        {/* Dark Top Section */}
        <Section className={cn(
          'dark bg-background flex flex-col relative h-full w-full',
          darkSectionClassName
        )}>
          <Box
            direction="col"
            gap={8}
            className={cn(
              'mb-72 mt-24 lg:mb-56 lg:mt-24 xl:mb-72 xl:mt-24 w-full max-w-[71.3rem] mx-auto'
            )}
          >
            {/* Top Content */}
            {contentTop && (
              <div className="relative z-10">
                {contentTop}
              </div>
            )}
          </Box>
        </Section>

        {/* Central Asset */}
        {asset && (
          <div className="relative flex items-center justify-center max-w-[71.3rem] w-full mx-auto">
            <Container className={cn('absolute z-20', assetClassName)}>
              {asset}
            </Container>
          </div>
        )}

        {/* Light Bottom Section */}
        <Section className={cn(
          'relative h-full w-full overflow-hidden',
          lightSectionClassName
        )}>
          <div className="mt-64 lg:mt-56 xl:mt-96">
            <Box direction="col" gap={8}>
              {/* Bottom Content */}
              {contentBottom && (
                <div className="relative z-10 w-[71.3rem] mx-auto">
                  {contentBottom}
                </div>
              )}
            </Box>
          </div>
        </Section>
      </div>
    </ErrorBoundary>
  );
}
