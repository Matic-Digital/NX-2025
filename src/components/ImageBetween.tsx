'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Box, Container, Section } from '@/components/global/matic-ds';
import { ContentGrid } from '@/components/ContentGrid';
import { AirImage } from '@/components/media/AirImage';
import { BannerHero } from '@/components/BannerHero';
import { Slider } from '@/components/Slider';
import type { ImageBetween } from '@/types/contentful/ImageBetween';
import type { Image } from '@/types/contentful/Image';
import type { ContentGrid as ContentGridType } from '@/types/contentful/ContentGrid';
import type { BannerHero as BannerHeroType } from '@/types/contentful/BannerHero';
import { getContentGridById } from '@/lib/contentful-api/content-grid';
import { getBannerHero } from '@/lib/contentful-api/banner-hero';
import { cn } from '@/lib/utils';

export function ImageBetween(props: ImageBetween) {
  const imageBetween = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: imageBetween?.sys?.id });
  const [contentTopData, setContentTopData] = useState<ContentGridType | BannerHeroType | null>(
    null
  );
  const [assetContentGrid, setAssetContentGrid] = useState<ContentGridType | null>(null);
  const [contentBottomData, setContentBottomData] = useState<ContentGridType | null>(null);

  console.log('ImageBetween props:', props);

  const isBannerHero = imageBetween.contentTop?.__typename === 'BannerHero';

  // Fetch full data for contentTop
  useEffect(() => {
    const fetchContentTop = async () => {
      if (imageBetween.contentTop?.sys?.id) {
        try {
          if (imageBetween.contentTop.__typename === 'ContentGrid') {
            const contentGridData = await getContentGridById(imageBetween.contentTop.sys.id);
            setContentTopData(contentGridData);
          } else if (isBannerHero) {
            const bannerHeroData = await getBannerHero(imageBetween.contentTop.sys.id);
            setContentTopData(bannerHeroData);
          }
        } catch (error) {
          console.error('Failed to fetch contentTop:', error);
          setContentTopData(null);
        }
      } else {
        setContentTopData(null);
      }
    };

    void fetchContentTop();
  }, [imageBetween.contentTop, isBannerHero]);

  // Fetch full ContentGrid data if asset is a ContentGrid
  useEffect(() => {
    const fetchAssetContentGrid = async () => {
      if (
        imageBetween.asset &&
        imageBetween.asset.__typename === 'ContentGrid' &&
        imageBetween.asset.sys?.id
      ) {
        try {
          const contentGridData = await getContentGridById(imageBetween.asset.sys.id);
          setAssetContentGrid(contentGridData);
        } catch (error) {
          console.error('Failed to fetch ContentGrid asset:', error);
          setAssetContentGrid(null);
        }
      } else {
        setAssetContentGrid(null);
      }
    };

    void fetchAssetContentGrid();
  }, [imageBetween.asset]);

  // Fetch full data for contentBottom
  useEffect(() => {
    const fetchContentBottom = async () => {
      if (
        imageBetween.contentBottom &&
        imageBetween.contentBottom.__typename === 'ContentGrid' &&
        imageBetween.contentBottom.sys?.id
      ) {
        try {
          const contentGridData = await getContentGridById(imageBetween.contentBottom.sys.id);
          setContentBottomData(contentGridData);
        } catch (error) {
          console.error('Failed to fetch contentBottom:', error);
          setContentBottomData(null);
        }
      } else {
        setContentBottomData(null);
      }
    };

    void fetchContentBottom();
  }, [imageBetween.contentBottom]);

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
        <Section
          className={cn('dark bg-background relative h-full w-full', isBannerHero && '!py-0')}
          {...inspectorProps}
        >
          {/* Dark Top Section */}
          <Box
            direction="col"
            gap={8}
            className={cn('mb-0', imageBetween.asset && 'mb-72', isBannerHero && 'mb-0')}
          >
            {/* Top Content Grid */}
            {imageBetween.contentTop && (
              <>
                {imageBetween.contentTop.__typename === 'ContentGrid' && contentTopData && (
                  <ContentGrid
                    {...(contentTopData as ContentGridType)}
                    isDarkMode={true}
                    componentType={imageBetween.__typename}
                  />
                )}
                {imageBetween.contentTop.__typename === 'BannerHero' && contentTopData && (
                  <BannerHero
                    {...(contentTopData as BannerHeroType)}
                    contentType={imageBetween.__typename}
                  />
                )}
              </>
            )}
          </Box>
        </Section>

        {/* Central Image */}
        {imageBetween.asset && (
          <div className="relative flex items-center justify-center">
            {/* Render asset based on type */}
            {imageBetween.asset && imageBetween.asset.__typename === 'Image' && (
              <Container className="absolute z-20">
                <AirImage
                  link={(imageBetween.asset as Image).link}
                  altText={(imageBetween.asset as Image).altText ?? imageBetween.asset.title ?? ''}
                  className="w-full object-contain"
                  {...inspectorProps({ fieldId: 'asset' })}
                />
              </Container>
            )}
            {imageBetween.asset && imageBetween.asset.__typename === 'Slider' && (
              <Container className="absolute z-20">
                <Slider {...imageBetween.asset} {...inspectorProps({ fieldId: 'asset' })} />
              </Container>
            )}
            {imageBetween.asset &&
              imageBetween.asset.__typename === 'ContentGrid' &&
              assetContentGrid && (
                <Container className="absolute z-20 !p-0">
                  <ContentGrid
                    {...assetContentGrid}
                    isDarkMode={true}
                    componentType={imageBetween.__typename}
                  />
                </Container>
              )}
          </div>
        )}

        <Section className="relative h-full w-full overflow-hidden">
          {/* Light Bottom Section */}
          <div className={cn('mt-0', imageBetween.asset && 'mt-72')}>
            <Box direction="col" gap={8}>
              {/* Bottom Content Grid */}
              {imageBetween.contentBottom && contentBottomData && (
                <ContentGrid {...contentBottomData} componentType={imageBetween.__typename} />
              )}
            </Box>
          </div>
        </Section>
      </div>
    </ErrorBoundary>
  );
}
