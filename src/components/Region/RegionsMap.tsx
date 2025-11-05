'use client';

import React, { useState } from 'react';
import Link from 'next/link';

import { ArrowUpRight } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Box } from '@/components/global/matic-ds';

import { RegionsMapImageInteractive } from '@/components/Region/RegionsMapImageInteractive';

// Static hardcoded regions data since the map is SVG-based
const STATIC_REGIONS = [
  { name: 'North America', slug: 'north-america' },
  { name: 'Europe', slug: 'europe' },
  { name: 'Asia Pacific', slug: 'asia-pacific' },
  { name: 'Latin America', slug: 'latin-america' },
  { name: 'Middle East & Africa', slug: 'middle-east-africa' }
];

export function RegionsMap() {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // Map region names to their corresponding SVG IDs
  const regionToSvgId: Record<string, string> = {
    'North America': 'northAmerica',
    'Europe': 'europe',
    'Asia Pacific': 'australiaPacific',
    'Latin America': 'latinAmerica',
    'Middle East & Africa': 'middleEastIndiaAfrica'
  };

  return (
    <div className="container mx-auto px-6 sm:px-6 md:px-9">
      <Box direction="col" gap={12} className="bg-subtle p-4 md:p-16">
        {/* Header */}
        <Box direction="col" gap={2} className="text-center">
          <p className="text-body-sm text-gray-700 uppercase">Global Presence</p>
          <h2 className="text-headline-md lg:text-headline-lg leading-14">Our Regions</h2>
        </Box>

        {/* World Map SVG */}
        <div className="relative">
          <div className="absolute inset-0 size-full"></div>
          <div className="relative z-10 w-full">
            <RegionsMapImageInteractive
              hoveredRegion={hoveredRegion}
              onRegionHover={setHoveredRegion}
            />
          </div>
        </div>

        {/* Region List */}
        <Box
          direction="row"
          gap={{ base: 12, lg: 12, xl: 6 }}
          cols={{
            base: 1,
            md: 2,
            lg: 3,
            xl: 5
          }}
        >
          {STATIC_REGIONS.map((region) => {
            const svgId = regionToSvgId[region.name];
            
            return (
              <div
                key={region.name}
                className={cn(
                  'group transition-all duration-200',
                  hoveredRegion === svgId ? 'scale-105 transform' : ''
                )}
                onMouseEnter={() => setHoveredRegion(svgId ?? null)}
                onMouseLeave={() => setHoveredRegion(null)}
              >
                <Link
                  href={`/regions/${region.slug}`}
                  className={cn(
                    'transition-colors',
                    hoveredRegion === svgId ? 'text-primary' : 'text-surface-invert'
                  )}
                >
                  <Box
                    direction="row"
                    gap={2}
                    className="items-center justify-between lg:items-start"
                  >
                    <Box direction="col" gap={0}>
                      <h3 className={cn('text-title-lg')}>{region.name}</h3>
                      <p className={cn(
                        '!text-body-xxs',
                        hoveredRegion === svgId ? 'text-primary transition-colors' : 'text-surface-invert'
                      )}>
                        Explore {region.name}
                      </p>
                    </Box>
                    <span className="text-muted-foreground group-hover:text-primary mt-1 opacity-100 transition-all group-hover:translate-x-1 group-hover:opacity-100 xl:opacity-0">
                      <ArrowUpRight className="size-8 stroke-1" />
                    </span>
                  </Box>
                </Link>
              </div>
            );
          })}
        </Box>
      </Box>
    </div>
  );
}
