'use client';

import React from 'react';
import { cn } from '@/lib/utils';

import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Box, Container, Section } from '@/components/global/matic-ds';
import { AirImage } from '@/components/Image/AirImage';
import type { z } from 'zod';
import type { MobileOriginSchema } from '@/components/Image/ImageSchema';

interface ImageBetweenWrapperProps {
  contentTop?: React.ReactNode;
  asset?: React.ReactNode;
  contentBottom?: React.ReactNode;
  className?: string;
  // Optional styling props
  darkSectionClassName?: string;
  lightSectionClassName?: string;
  assetClassName?: string;
  // Background image for dark section
  backgroundImage?: {
    link: string;
    altText?: string;
    mobileOrigin?: z.infer<typeof MobileOriginSchema>;
  };
  // Variant for different spacing patterns
  variant?: 'article' | 'default';
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
  assetClassName,
  backgroundImage,
  variant = 'article'
}: ImageBetweenWrapperProps) {
  return (
    <ErrorBoundary>
      <div className={cn('relative', className)}>
        {/* Dark Top Section */}
        <Section className={cn(
          'dark bg-background flex flex-col relative h-full w-full',
          darkSectionClassName
        )}>
          {backgroundImage && (
            <AirImage
              link={backgroundImage.link}
              altText={backgroundImage.altText ?? ''}
              mobileOrigin={backgroundImage.mobileOrigin}
              className="absolute inset-0 w-full h-full z-0"
            />
          )}
          {variant === 'article' ? (
            <Box
              direction="col"
              gap={8}
              className={cn(
                'mb-80 pb-24 mt-24 lg:mb-64 lg:pb-32 lg:mt-24 xl:mb-80 xl:pb-40 xl:mt-24 w-full max-w-full lg:max-w-[71.3rem] mx-auto'
              )}
            >
              {/* Top Content */}
              {contentTop && (
                <div className="relative z-10">
                  {contentTop}
                </div>
              )}
            </Box>
          ) : (
            /* Default variant - no article spacing */
            contentTop && (
              <div className="relative z-10 w-full pb-24">
                {contentTop}
              </div>
            )
          )}
        </Section>

        {/* Central Asset */}
        {asset && (
          <div className={cn(
            'relative flex items-center justify-center w-full mx-auto',
            variant === 'article' ? 'max-w-full lg:max-w-[71.3rem]' : 'max-w-full'
          )}>
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
          {variant === 'article' ? (
            <div className="mt-48 pt-24 lg:mt-60 lg:pt-32 xl:mt-64 xl:pt-40">
              <Box direction="col" gap={8}>
                {/* Bottom Content */}
                {contentBottom && (
                  <div className="relative z-10 w-full max-w-full lg:max-w-[71.3rem] mx-auto">
                    {contentBottom}
                  </div>
                )}
              </Box>
            </div>
          ) : (
            /* Default variant - no article spacing */
            contentBottom && (
              <div className="relative z-10 w-full pt-24">
                {contentBottom}
              </div>
            )
          )}
        </Section>
      </div>
    </ErrorBoundary>
  );
}
