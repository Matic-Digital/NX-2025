'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import type { RegionStats } from '@/components/RegionStats/RegionStatsSchema';

/**
 * Custom hook for BannerHero data management
 * Handles Contentful live preview and inspector mode
 */
export const useRegionStatsData = (props: RegionStats) => {
  const regionStats = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: regionStats?.sys?.id });

  return {
    regionStats,
    inspectorProps
  };
};
