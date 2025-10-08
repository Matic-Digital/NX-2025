'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { cn } from '@/lib/utils';

import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Box, Container, Section } from '@/components/global/matic-ds';

import { BannerHero } from '@/components/BannerHero/BannerHero';
import { getBannerHero } from '@/components/BannerHero/BannerHeroApi';
import { ContentGrid } from '@/components/ContentGrid/ContentGrid';
import { getContentGridById } from '@/components/ContentGrid/ContentGridApi';
import { AirImage } from '@/components/Image/AirImage';
import { Slider } from '@/components/Slider/Slider';
import { getSlidersByIds } from '@/components/Slider/SliderApi';

import type { BannerHero as BannerHeroType } from '@/components/BannerHero/BannerHeroSchema';
import type { ContentGrid as ContentGridType } from '@/components/ContentGrid/ContentGridSchema';
import type { Image } from '@/components/Image/ImageSchema';
import type { ImageBetween } from '@/components/ImageBetween/ImageBetweenSchema';

export function ImageBetween(props: ImageBetween) {
  const imageBetween = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: imageBetween?.sys?.id });
  const [contentTopData, setContentTopData] = useState<ContentGridType | BannerHeroType | null>(
    null
  );
  const [assetContentGrid, setAssetContentGrid] = useState<ContentGridType | null>(null);
  const [contentBottomData, setContentBottomData] = useState<ContentGridType | null>(null);
  const [sliderData, setSliderData] = useState<{ itemsCollection?: { items?: Array<{ __typename?: string }> } } | null>(null);

  const isBannerHero = imageBetween.contentTop?.__typename === 'BannerHero';
  
  // Check if the slider contains Post items
  const isPostSlider = sliderData?.itemsCollection?.items?.[0]?.__typename === 'Post';

  // Fetch full data for contentTop
  useEffect(() => {
    const fetchContentTop = async () => {
      if (imageBetween.contentTop?.sys?.id) {
        try {
          if (imageBetween.contentTop.__typename === 'ContentGrid') {
            const contentGridData = await getContentGridById(imageBetween.contentTop.sys.id ?? '');
            setContentTopData(contentGridData);
          } else if (isBannerHero) {
            const bannerHeroData = await getBannerHero(imageBetween.contentTop.sys.id ?? '');
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
          const contentGridData = await getContentGridById(imageBetween.asset.sys.id ?? '');
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

  // Fetch slider data if asset is a Slider
  useEffect(() => {
    const fetchSliderData = async () => {
      if (
        imageBetween.asset &&
        imageBetween.asset.__typename === 'Slider' &&
        imageBetween.asset.sys?.id
      ) {
        try {
          const data = await getSlidersByIds([imageBetween.asset.sys.id]);
          if (data.length > 0 && data[0]) {
            setSliderData(data[0]);
          }
        } catch (error) {
          console.error('Failed to fetch Slider asset:', error);
          setSliderData(null);
        }
      } else {
        setSliderData(null);
      }
    };

    void fetchSliderData();
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
          const contentGridData = await getContentGridById(imageBetween.contentBottom.sys.id ?? '');
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
            className={cn(
              'mb-0 pb-8',
              imageBetween.asset &&
                imageBetween.asset.__typename === 'Image' &&
                'mb-24 lg:mb-56 xl:mb-96',
              imageBetween.asset && imageBetween.asset.__typename !== 'Image' && 'mb-72',
              isBannerHero && 'mb-0 pb-16'
            )}
          >
            {/* Top Content Grid */}
            {imageBetween.contentTop && (
              <>
                {imageBetween.contentTop.__typename === 'ContentGrid' && contentTopData && (
                  <ContentGrid
                    {...(contentTopData as ContentGridType)}
                    componentType={imageBetween.__typename}
                  />
                )}
                {imageBetween.contentTop.__typename === 'BannerHero' && contentTopData && (
                  <div className="pb-16 -mb-16">
                    <BannerHero
                      {...(contentTopData as BannerHeroType)}
                      contentType={imageBetween.__typename}
                    />
                  </div>
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
              <Container className={cn(
                "absolute z-20",
                isPostSlider && "mt-8 mb-24 lg:mt-12 lg:mb-32 xl:mt-16 xl:my-44"
              )}>
                <Slider 
                  {...imageBetween.asset} 
                  {...inspectorProps({ fieldId: 'asset' })} 
                  context="ImageBetween"
                />
              </Container>
            )}
            {imageBetween.asset &&
              imageBetween.asset.__typename === 'ContentGrid' &&
              assetContentGrid && (
                <Container className="z-20 -mt-[18rem] -mb-[20rem] !px-0 lg:absolute">
                  <ContentGrid
                    {...assetContentGrid}
                    componentType={imageBetween.__typename}
                    forceTabletSingleColumn={true}
                  />
                </Container>
              )}
          </div>
        )}

        <Section className="relative h-full w-full overflow-hidden">
          {/* Light Bottom Section */}
          <div
            className={cn(
              'mt-0',
              imageBetween.asset &&
                imageBetween.asset.__typename === 'Image' &&
                'mt-28 lg:mt-56 xl:mt-96',
              imageBetween.asset && imageBetween.asset.__typename !== 'Image' && 'mt-72'
            )}
          >
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
