'use client';

import { ErrorBoundary } from '@/components/global/ErrorBoundary';

import { BannerHeroContent } from '@/components/BannerHero/components/BannerHeroContent';
import { LoadingState } from '@/components/BannerHero/components/BannerHeroStates';
import { useBannerHeroData } from '@/components/BannerHero/hooks/UseBannerHeroData';
import { useBannerHeroLogic } from '@/components/BannerHero/hooks/UseBannerHeroLogic';

import type { BannerHero } from '@/components/BannerHero/BannerHeroSchema';

interface BannerHeroProps extends BannerHero {
  productContext?: {
    type: 'product';
  };
  contentType?: string;
}

/**
 * Main BannerHero component - orchestrates all layers
 * Pure composition of data, logic, and presentation layers
 */
export function BannerHero(props: BannerHeroProps) {
  // Data layer
  const { bannerHero, inspectorProps } = useBannerHeroData(props);

  // Business logic layer
  const { isCenteredSectionHeading, isImageBetween } = useBannerHeroLogic(props, bannerHero);

  // Loading state
  if (!bannerHero) {
    return <LoadingState />;
  }

  return (
    <ErrorBoundary>
      <BannerHeroContent
        bannerHero={bannerHero}
        inspectorProps={inspectorProps}
        isCenteredSectionHeading={isCenteredSectionHeading}
        isImageBetween={isImageBetween}
      />
    </ErrorBoundary>
  );
}
