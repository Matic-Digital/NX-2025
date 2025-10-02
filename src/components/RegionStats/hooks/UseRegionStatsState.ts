import type { RegionStats } from '@/components/RegionStats/RegionStatsSchema';

export const useRegionStatsState = (regionStats: RegionStats | null) => {
  const hasData = !!regionStats;
  return {
    currentState: hasData ? 'content' : 'empty',
    shouldRenderContent: hasData
  };
};
