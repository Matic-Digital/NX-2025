'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { Box, Container } from '@/components/global/matic-ds';

import { AirImage } from '@/components/Image/AirImage';
import { EmptyState } from '@/components/RegionStats/components/RegionStatsState';
import { useRegionStatsData } from '@/components/RegionStats/hooks/UseRegionStatsData';
import { useRegionStatsState } from '@/components/RegionStats/hooks/UseRegionStatsState';
import { RegionStatItem } from '@/components/RegionStats/RegionStatItem/RegionStatItem';

import type { RegionStats } from '@/components/RegionStats/RegionStatsSchema';

export function RegionStats(props: RegionStats) {
  const { regionStats } = useRegionStatsData(props);
  const { currentState, shouldRenderContent } = useRegionStatsState(regionStats);

  if (currentState === 'empty') {
    return <EmptyState />;
  }

  if (!shouldRenderContent) {
    return null;
  }

  const { title, image, itemsCollection, cta } = regionStats;

  const hasCta = cta?.internalLink?.slug ?? cta?.externalLink ?? '';

  return (
    <Container className="md:p-16">
      <Box direction={{ base: 'col', lg: 'row' }} gap={12}>
        <div className="basis-1/2 flex">
          <AirImage
            link={image?.url || ''}
            altText={image?.description || ''}
            width={image?.width}
            height={image?.height}
            className="w-full h-full object-cover"
          />
        </div>
        <Box direction="col" gap={4} className="basis-1/2 h-full justify-center">
          <h2 className="text-headline-lg text-text-body">{title}</h2>
          <Box direction="col">
            {itemsCollection.items.map((item) => (
              <RegionStatItem key={item.sys.id} {...item} />
            ))}
          </Box>
          {hasCta && (
            <Link href={hasCta} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-fit">
                {cta?.text}
              </Button>
            </Link>
          )}
        </Box>
      </Box>
    </Container>
  );
}
