'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import type { BannerHero } from '@/components/BannerHero/BannerHeroSchema';

interface BannerHeroProps extends BannerHero {
  productContext?: {
    type: 'product';
  };
  contentType?: string;
}

/**
 * Custom hook for BannerHero data management
 * Handles Contentful live preview and inspector mode
 */
export const useBannerHeroData = (props: BannerHeroProps) => {
  const bannerHero = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: bannerHero?.sys?.id });

  return {
    bannerHero,
    inspectorProps
  };
};
