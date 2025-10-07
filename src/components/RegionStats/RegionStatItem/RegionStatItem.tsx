'use client';

import { Box } from '@/components/global/matic-ds';

import type { RegionStatItem } from '@/components/RegionStats/RegionStatItem/RegionStatItemSchema';

export function RegionStatItem(props: RegionStatItem) {
  const { heading, subHeading, description } = props;
  return (
    <Box
      direction={{ base: 'col', lg: 'row' }}
      gap={4}
      className="py-6 border-b-2 border-border-subtle last:border-b-0"
    >
      <Box gap={2} className="items-start">
        <h2 className="text-display-sm text-text-body">{heading}</h2>
        <p className="text-body-sm text-text-body">{subHeading}</p>
      </Box>
      <p className="text-body-md text-text-subtle lg:max-w-xs lg:ml-auto">{description}</p>
    </Box>
  );
}
