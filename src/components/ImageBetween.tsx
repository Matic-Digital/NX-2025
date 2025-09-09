'use client';

import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Box, Container, Section } from '@/components/global/matic-ds';
import { ContentGrid } from '@/components/ContentGrid';
import { AirImage } from '@/components/media/AirImage';
import { Slider } from '@/components/Slider';
import type { ImageBetween } from '@/types/contentful/ImageBetween';
import type { Image } from '@/types/contentful/Image';
import { cn } from '@/lib/utils';

export function ImageBetween(props: ImageBetween) {
  const imageBetween = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: imageBetween?.sys?.id });

  return (
    <ErrorBoundary>
      <div className="relative max-w-screen overflow-hidden">
        <div className="pointer-events-none absolute z-30 h-full w-full opacity-10 invert">
          {/* Background Media */}
          {imageBetween.backgroundMedia && (
            <AirImage
              link={imageBetween.backgroundMedia.url}
              altText={
                imageBetween.backgroundMedia.description ?? imageBetween.backgroundMedia.title ?? ''
              }
              width={imageBetween.backgroundMedia.width}
              height={imageBetween.backgroundMedia.height}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
        <Section className="dark bg-background relative h-full w-full" {...inspectorProps}>
          {/* Dark Top Section */}

          <Box direction="col" gap={8} className={cn('mb-0', imageBetween.asset && 'mb-72')}>
            {/* Top Content Grid */}
            {imageBetween.contentTop && (
              <ContentGrid
                {...imageBetween.contentTop}
                isDarkMode={true}
                componentType={imageBetween.__typename}
              />
            )}
          </Box>
        </Section>

        {/* Central Image */}
        {imageBetween.asset && (
          <div className="relative flex items-center justify-center">
            <Container className="absolute z-20">
              {/* Render asset based on type */}
              {imageBetween.asset && imageBetween.asset.__typename === 'Image' && (
                <AirImage
                  link={(imageBetween.asset as Image).link}
                  altText={(imageBetween.asset as Image).altText ?? imageBetween.asset.title ?? ''}
                  className="w-full object-contain"
                  {...inspectorProps({ fieldId: 'asset' })}
                />
              )}
              {imageBetween.asset && imageBetween.asset.__typename === 'Slider' && (
                <Slider {...imageBetween.asset} {...inspectorProps({ fieldId: 'asset' })} />
              )}
            </Container>
          </div>
        )}

        <Section className="relative h-full w-full overflow-hidden">
          {/* Light Bottom Section */}
          <div className={cn('mt-0', imageBetween.asset && 'mt-72')}>
            <Box direction="col" gap={8}>
              {/* Bottom Content Grid */}
              {imageBetween.contentBottom && (
                <div>
                  <ContentGrid {...imageBetween.contentBottom} />
                </div>
              )}
            </Box>
          </div>
        </Section>
      </div>
    </ErrorBoundary>
  );
}
