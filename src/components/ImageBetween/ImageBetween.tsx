'use client';

// No longer need useState/useEffect - using server-side enriched data directly
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { cn } from '@/lib/utils';

import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Box, Container, Section } from '@/components/global/matic-ds';

import { BannerHero } from '@/components/BannerHero/BannerHero';
import { ContentGrid } from '@/components/ContentGrid/ContentGrid';
import { AirImage } from '@/components/Image/AirImage';
import { Slider } from '@/components/Slider/Slider';

import type { BannerHero as BannerHeroType } from '@/components/BannerHero/BannerHeroSchema';
import type { ContentGrid as ContentGridType } from '@/components/ContentGrid/ContentGridSchema';
import type { Image } from '@/components/Image/ImageSchema';
import type { ImageBetween } from '@/components/ImageBetween/ImageBetweenSchema';

export function ImageBetween(props: ImageBetween) {
  const imageBetween = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: imageBetween?.sys?.id });

  // Server-side enriched data is now available directly in props

  // Use server-side enriched data directly (no client-side state needed)
  const contentTopData = imageBetween.contentTop;
  const assetContentGrid = imageBetween.asset?.__typename === 'ContentGrid' ? imageBetween.asset : null;
  const contentBottomData = imageBetween.contentBottom;
  const sliderData = imageBetween.asset?.__typename === 'Slider' ? imageBetween.asset as any : null;

  const isBannerHero = imageBetween.contentTop?.__typename === 'BannerHero';

  // Check if the slider contains Post items (only if it's actually a Slider)
  const isPostSlider = sliderData?.itemsCollection?.items?.[0]?.__typename === 'Post';
  const _isImageSlider = sliderData?.itemsCollection?.items?.[0]?.__typename === 'Image';

  return (
    <ErrorBoundary>
      <div className="relative max-w-screen overflow-hidden">
        <div className="pointer-events-none absolute z-30 h-full w-full opacity-10 invert">
          {/* Background Media */}
          {imageBetween.backgroundMedia && (
            <AirImage
              link={imageBetween.backgroundMedia?.url || ''}
              altText={
                imageBetween.backgroundMedia.description ?? imageBetween.backgroundMedia.title ?? ''
              }
              width={imageBetween.backgroundMedia.width}
              height={imageBetween.backgroundMedia.height}
              className="absolute inset-0 h-full w-full"
            />
          )}
        </div>
        {isBannerHero ? (
          /* BannerHero fills entire Section without Box wrapper */
          <Section
            className="dark bg-background relative h-full w-full !py-0 !pt-0 !pb-0"
            {...inspectorProps}
          >
            {imageBetween.contentTop?.__typename === 'BannerHero' && contentTopData && (
              <div className="h-full" {...inspectorProps({ fieldId: 'contentTop' })}>
                <BannerHero
                  {...(contentTopData as BannerHeroType)}
                  contentType={imageBetween.__typename}
                />
              </div>
            )}
          </Section>
        ) : (
          /* Non-BannerHero content uses Box wrapper */
          <Section
            className="dark bg-background relative h-full w-full"
            {...inspectorProps}
          >
            <Box
              direction="col"
              gap={8}
              className={cn(
                'mb-0 pb-8',
                // Image assets get large bottom margin
                imageBetween.asset?.__typename === 'Image' &&
                  'mb-24 lg:mb-56 xl:mb-96',
                // Non-image assets default to large margin
                imageBetween.asset && 
                  imageBetween.asset.__typename !== 'Image' && 
                  imageBetween.asset.__typename !== 'ContentGrid' &&
                  imageBetween.asset.__typename !== 'Slider' &&
                  'mb-72',
                // ContentGrid assets get no margin
                imageBetween.asset?.__typename === 'ContentGrid' && 'mb-0',
                // Slider assets get different margins based on contentTop
                imageBetween.asset?.__typename === 'Slider' && 
                  (imageBetween.contentTop?.__typename !== 'ContentGrid') && 'mb-72',
                imageBetween.asset?.__typename === 'Slider' && 
                  imageBetween.contentTop?.__typename === 'ContentGrid' && 'mb-8'
              )}
            >
              {/* Top Content Grid */}
              {imageBetween.contentTop && (
                <>
                  {imageBetween.contentTop?.__typename === 'ContentGrid' && contentTopData && (
                    <>
                      <div 
                        className={cn(
                          // Add bottom padding when ContentGrid has no items (only section heading)
                          !(contentTopData as ContentGridType).itemsCollection?.items?.length && 'pb-[4rem]'
                        )}
                        {...inspectorProps({ fieldId: 'contentTop' })}
                      >
                        <ContentGrid
                          {...(contentTopData as ContentGridType)}
                          componentType={imageBetween.__typename}
                          isInsideImageBetween={true}
                        />
                      </div>
                      {/* Additional spacer when ContentGrid has no items */}
                      {!(contentTopData as ContentGridType).itemsCollection?.items?.length && (
                        <div className="h-48" />
                      )}
                    </>
                  )}
                </>
              )}
            </Box>
          </Section>
        )}

        {/* Central Image */}
        {imageBetween.asset && (
          <div
            className={cn(
              'relative flex items-center justify-center',
              imageBetween.asset.__typename === 'Image' &&
                '-mt-12 -mb-8 lg:-mt-28 lg:-mb-16 xl:-mt-48 xl:-mb-24'
            )}
          >
            {/* Render asset based on type */}
            {imageBetween.asset?.__typename === 'Image' && (
              <Container className="absolute z-20">
                <AirImage
                  link={(imageBetween.asset as Image).link}
                  altText={(imageBetween.asset as Image).altText ?? imageBetween.asset.title ?? ''}
                  mobileOrigin={(imageBetween.asset as Image).mobileOrigin}
                  className="w-full lcp-image"
                  priority={true}
                  {...inspectorProps({ fieldId: 'asset' })}
                />
              </Container>
            )}
            {imageBetween.asset?.__typename === 'Slider' && (
              <Container
                className={cn(
                  'absolute z-20',
                  isPostSlider && 'mt-8 mb-24 lg:mt-12 lg:mb-32 xl:mt-16 xl:my-44'
                )}
              >
                <Slider
                  {...imageBetween.asset}
                  {...inspectorProps({ fieldId: 'asset' })}
                  context="ImageBetween"
                />
              </Container>
            )}
            {imageBetween.asset?.__typename === 'ContentGrid' &&
              assetContentGrid && (
                <Container
                  className={cn(
                    'z-20 !px-0 lg:absolute',
                    contentTopData ? '-mt-[6rem] -mb-[20rem]' : '-mt-[18rem] -mb-[20rem]'
                  )}
                  {...inspectorProps({ fieldId: 'asset' })}
                >
                  <ContentGrid
                    {...(assetContentGrid as ContentGridType)}
                    componentType={imageBetween.__typename}
                    forceTabletSingleColumn={true}
                    isInsideImageBetween={true}
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
              imageBetween.asset?.__typename === 'Image' &&
                'mt-28 lg:mt-56 xl:mt-96',
              imageBetween.asset && imageBetween.asset.__typename !== 'Image' && 'mt-72'
            )}
          >
            <Box direction="col" gap={8}>
              {/* Bottom Content Grid */}
              {imageBetween.contentBottom && contentBottomData && (
                <div className="pt-16 md:pt-20 lg:pt-24">
                  <ContentGrid
                    {...contentBottomData}
                    componentType={imageBetween.__typename}
                    isInsideImageBetween={true}
                  />
                </div>
              )}
            </Box>
          </div>
        </Section>
      </div>
    </ErrorBoundary>
  );
}
