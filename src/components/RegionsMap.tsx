'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getRegionsMapById } from '@/lib/contentful-api/region';
import type { RegionsMap } from '@/types/contentful/Region';
import type { Region } from '@/types/contentful/Region';

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
    'Australia & Pacific': 'australiaPacific',
    'Middle East, India & North Africa': 'middleEastIndiaAfrica'
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
    <div className="bg-subtle mx-auto w-full max-w-6xl px-6 py-16">
      {/* Header */}
      <div className="mb-16 text-center">
        <p className="mb-4 text-sm tracking-wider text-gray-500 uppercase">{overline}</p>
        <h2 className="mb-8 text-4xl font-light text-gray-900 md:text-5xl">{title}</h2>
      </div>

      {/* World Map SVG */}
      <div className="relative mb-16">
        <svg viewBox="0 0 1000 500" className="h-auto w-full" style={{ maxHeight: '400px' }}>
          {/* Dotted World Map Pattern */}
          <defs>
            <pattern id="dots" patternUnits="userSpaceOnUse" width="4" height="4">
              <circle cx="2" cy="2" r="0.8" fill="currentColor" opacity="0.3" />
            </pattern>
          </defs>

          {/* North America */}
          <g
            className={cn(
              'cursor-pointer transition-colors duration-200',
              hoveredRegion === 'northAmerica' ? 'text-orange-500' : 'text-gray-400'
            )}
            onMouseEnter={() => setHoveredRegion('northAmerica')}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            <path
              d="M50 100 L280 80 L300 180 L250 220 L180 200 L120 180 L80 150 Z"
              fill="url(#dots)"
              stroke="currentColor"
              strokeWidth="1"
              opacity={hoveredRegion === 'northAmerica' ? 0.8 : 0.4}
            />
            {/* Region Pin */}
            <circle cx="200" cy="150" r="4" fill="currentColor" />
          </g>

          {/* Europe */}
          <g
            className={cn(
              'cursor-pointer transition-colors duration-200',
              hoveredRegion === 'europe' ? 'text-orange-500' : 'text-gray-400'
            )}
            onMouseEnter={() => setHoveredRegion('europe')}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            <path
              d="M350 80 L480 70 L500 140 L450 160 L380 150 L360 120 Z"
              fill="url(#dots)"
              stroke="currentColor"
              strokeWidth="1"
              opacity={hoveredRegion === 'europe' ? 0.8 : 0.4}
            />
            {/* Region Pin */}
            <circle cx="420" cy="120" r="4" fill="currentColor" />
          </g>

          {/* Latin America */}
          <g
            className={cn(
              'cursor-pointer transition-colors duration-200',
              hoveredRegion === 'latinAmerica' ? 'text-orange-500' : 'text-gray-400'
            )}
            onMouseEnter={() => setHoveredRegion('latinAmerica')}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            <path
              d="M200 250 L280 240 L300 350 L250 380 L180 360 L160 300 Z"
              fill="url(#dots)"
              stroke="currentColor"
              strokeWidth="1"
              opacity={hoveredRegion === 'latinAmerica' ? 0.8 : 0.4}
            />
            {/* Region Pin */}
            <circle cx="240" cy="310" r="4" fill="currentColor" />
          </g>

          {/* Australia Pacific */}
          <g
            className={cn(
              'cursor-pointer transition-colors duration-200',
              hoveredRegion === 'australiaPacific' ? 'text-orange-500' : 'text-gray-400'
            )}
            onMouseEnter={() => setHoveredRegion('australiaPacific')}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            <path
              d="M750 300 L900 290 L920 360 L880 380 L780 370 L760 340 Z"
              fill="url(#dots)"
              stroke="currentColor"
              strokeWidth="1"
              opacity={hoveredRegion === 'australiaPacific' ? 0.8 : 0.4}
            />
            {/* Region Pin */}
            <circle cx="830" cy="330" r="4" fill="currentColor" />
          </g>

          {/* Middle East, India, & North Africa */}
          <g
            className={cn(
              'cursor-pointer transition-colors duration-200',
              hoveredRegion === 'middleEastIndiaAfrica' ? 'text-orange-500' : 'text-gray-400'
            )}
            onMouseEnter={() => setHoveredRegion('middleEastIndiaAfrica')}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            <path
              d="M480 150 L650 140 L680 250 L620 280 L520 270 L500 200 Z"
              fill="url(#dots)"
              stroke="currentColor"
              strokeWidth="1"
              opacity={hoveredRegion === 'middleEastIndiaAfrica' ? 0.8 : 0.4}
            />
            {/* Region Pin */}
            <circle cx="580" cy="210" r="4" fill="currentColor" />
          </g>
        </svg>
      </div>

      {/* Region List */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
        {regionNames.map((regionName) => {
          const regionLocations = regionsByRegion?.[regionName] ?? [];

          console.log('RegionsMap: regionLocations', regionLocations);

          return (
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
                <div className="space-y-1">
                  {regionLocations.map((region) => (
                    <Link
                      key={region.sys.id}
                      href={`/${region.slug}`}
                      className={cn(
                        'block text-sm text-gray-600 transition-colors group-hover:text-orange-500',
                        hoveredRegion === (regionToSvgId[regionName] ?? regionName)
                          ? 'text-orange-500'
                          : 'text-gray-900'
                      )}
                    >
                      <h3
                        className={cn(
                          'mb-2 text-lg font-medium transition-colors duration-200',
                          hoveredRegion === (regionToSvgId[regionName] ?? regionName)
                            ? 'text-orange-500'
                            : 'text-gray-900'
                        )}
                      >
                        {regionName}
                      </h3>
                      {region.street}, {region.city}, {region.country}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No locations</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
