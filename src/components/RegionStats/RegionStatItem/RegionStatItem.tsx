'use client';

import type { RegionStatItem } from '@/components/RegionStats/RegionStatItem/RegionStatItemSchema';

export function RegionStatItem(props: RegionStatItem) {
  return <div>{props.heading}</div>;
}
