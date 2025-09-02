'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getRegionsMapById } from '@/lib/contentful-api/region';
import type { RegionsMap } from '@/types/contentful/Region';
import type { Region } from '@/types/contentful/Region';
import { Box } from '@/components/global/matic-ds';
import { ArrowUpRight } from 'lucide-react';
import { RegionsMapImageInteractive } from '@/components/RegionsMapImageInteractive';

export function RegionsMap(props: RegionsMap) {
  const [content, setContent] = useState<RegionsMap | null>(props);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await getRegionsMapById(props.sys.id);

        if (!response) {
          console.error('No regions map data returned');
          setError('No region data found');
          return;
        }

        setContent(response);
      } catch (err) {
        console.error('Error fetching region data:', err);
        setError('Failed to load region data');
      } finally {
        setLoading(false);
      }
    };

    void fetchContent();
  }, [props.sys.id]);

  // Provide default values to prevent destructuring errors
  const { title = '', overline = '', regionsCollection = { items: [] } } = content ?? {};

  const regions = regionsCollection?.items ?? [];

  // Map region names to their corresponding SVG IDs
  const regionToSvgId: Record<string, string> = {
    'North America': 'northAmerica',
    Europe: 'europe',
    'Latin America': 'latinAmerica',
    'Australia Pacific': 'australiaPacific',
    'Middle East, India, & North Africa': 'middleEastIndiaAfrica'
  };

  // Group regions by their name
  const regionsByRegion = regions.reduce<Record<string, Region[]>>((acc, region) => {
    const regionName = region.region;
    acc[regionName] = [...(acc[regionName] ?? []), region];
    return acc;
  }, {});

  // Get region names, sorted to match the desired order
  const regionNames = Object.keys(regionsByRegion).sort((a, b) => {
    const order = Object.keys(regionToSvgId);
    return order.indexOf(a) - order.indexOf(b);
  });

  // Handle loading and error states
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg">Loading regions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center text-red-500">
        <p>Error loading regions: {error}</p>
      </div>
    );
  }

  if (regions.length === 0) {
    return <div className="py-16 text-center text-gray-500">No regions available</div>;
  }

  return (
    <div className="container mx-auto px-6 sm:px-6 md:px-9">
      <Box direction="col" gap={12} className="bg-subtle p-4 md:p-16">
        {/* Header */}
        <Box direction="col" gap={2} className="text-center">
          <p className="text-text-input text-body-sm uppercase">{overline}</p>
          <h2 className="text-headline-md lg:text-headline-lg leading-14">{title}</h2>
        </Box>

        {/* World Map SVG */}
        <div className="relative">
          <div className="absolute inset-0 z-20 size-full"></div>
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
          {regionNames.map((regionName) => {
            const regionLocations = regionsByRegion?.[regionName] ?? [];

            return (
              <>
                <div
                  key={regionName}
                  className={cn(
                    'group transition-all duration-200',
                    hoveredRegion === (regionToSvgId[regionName] ?? regionName)
                      ? 'scale-105 transform'
                      : ''
                  )}
                  onMouseEnter={() => setHoveredRegion(regionToSvgId[regionName] ?? regionName)}
                  onMouseLeave={() => setHoveredRegion(null)}
                >
                  {regionLocations.length > 0 ? (
                    <>
                      {regionLocations.map((region) => (
                        <Link
                          key={region.sys.id}
                          href={`/${region.slug}`}
                          className={cn(
                            'transition-colors',
                            hoveredRegion === (regionToSvgId[regionName] ?? regionName)
                              ? 'text-primary'
                              : 'text-surface-invert'
                          )}
                        >
                          <Box
                            direction="row"
                            gap={2}
                            className="items-center justify-between lg:items-start"
                          >
                            <Box direction="col" gap={0}>
                              <h3 className={cn('text-title-lg')}>{regionName}</h3>

                              <p
                                className={cn(
                                  '!text-body-xxs',
                                  hoveredRegion === (regionToSvgId[regionName] ?? regionName)
                                    ? 'text-primary transition-colors'
                                    : 'text-surface-invert'
                                )}
                              >
                                {region.street}, {region.city}, {region.country}
                              </p>
                            </Box>
                            <span className="text-muted-foreground group-hover:text-primary mt-1 opacity-100 transition-all group-hover:translate-x-1 group-hover:opacity-100 xl:opacity-0">
                              <ArrowUpRight className="size-8 stroke-1" />
                            </span>
                          </Box>
                        </Link>
                      ))}
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">No locations</p>
                  )}
                </div>
                <div className="border-border border-b last-of-type:hidden md:hidden"></div>
              </>
            );
          })}
        </Box>
      </Box>
    </div>
  );
}
