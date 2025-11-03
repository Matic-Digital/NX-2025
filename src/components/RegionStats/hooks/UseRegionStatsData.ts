'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import type { RegionStats } from '@/components/RegionStats/RegionStatsSchema';

/**
 * Custom hook for RegionStats data management
 * Handles Contentful live preview (same pattern as ContentGrid)
 */
export const useRegionStatsData = (props: RegionStats) => {
  const regionStats = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: regionStats?.sys?.id });

  return {
    regionStats,
    inspectorProps
  };
};
