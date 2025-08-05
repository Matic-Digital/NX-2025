'use client';

import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Box, Container, Section } from '@/components/global/matic-ds';
import { ContentGrid } from '@/components/ContentGrid';
import { AirImage } from '@/components/media/AirImage';
import type { ImageBetween } from '@/types/contentful/ImageBetween';

export function ImageBetween(props: ImageBetween) {
  const imageBetween = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: imageBetween?.sys?.id });

  return (
    <ErrorBoundary>
      <Section className="relative h-full w-full overflow-hidden" {...inspectorProps}>
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
            priority
          />
        )}

        {/* Dark Top Section */}

        <Box direction="col" gap={8}>
          {/* Top Content Grid */}
          {imageBetween.contentTop && (
            <ContentGrid {...imageBetween.contentTop} isDarkMode={true} />
          )}
        </Box>

        {/* Central Image */}
        <div className="relative">
          <Container>
            {/* TODO: add video and other assets */}
            {imageBetween.asset && (
              <AirImage
                link={imageBetween.asset.link}
                altText={imageBetween.asset.altText}
                className="w-full object-contain"
                {...inspectorProps({ fieldId: 'asset' })}
              />
            )}
          </Container>
        </div>

        {/* Light Bottom Section */}
        <div className="relative">
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
    </ErrorBoundary>
  );
}
