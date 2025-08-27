'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { GlobalLocation } from '@/types/contentful/GlobalLocation';

interface InteractiveWorldMapProps {
  title?: string;
  overline?: string;
  locations: GlobalLocation[];
}

type RegionKey = 'northAmerica' | 'europe' | 'latinAmerica' | 'australiaPacific' | 'middleEastIndiaAfrica';

const regionDisplayNames: Record<RegionKey, string> = {
  northAmerica: 'North America',
  europe: 'Europe',
  latinAmerica: 'Latin America',
  australiaPacific: 'Australia Pacific',
  middleEastIndiaAfrica: 'Middle East, India, & North Africa'
};

export function InteractiveWorldMap({ title, overline, locations }: InteractiveWorldMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<RegionKey | null>(null);

  // Group locations by region
  const locationsByRegion = locations.reduce((acc, location) => {
    if (!acc[location.region]) {
      acc[location.region] = [];
    }
    acc[location.region].push(location);
    return acc;
  }, {} as Record<RegionKey, GlobalLocation[]>);

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        {overline && (
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">
            {overline}
          </p>
        )}
        {title && (
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-8">
            {title}
          </h2>
        )}
      </div>

      {/* World Map SVG */}
      <div className="relative mb-16">
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-auto"
          style={{ maxHeight: '400px' }}
        >
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
            {/* Location Pin */}
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
            {/* Location Pin */}
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
            {/* Location Pin */}
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
            {/* Location Pin */}
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
            {/* Location Pin */}
            <circle cx="580" cy="210" r="4" fill="currentColor" />
          </g>
        </svg>
      </div>

      {/* Region List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {Object.entries(regionDisplayNames).map(([regionKey, displayName]) => {
          const regionLocations = locationsByRegion[regionKey as RegionKey] || [];
          
          return (
            <div
              key={regionKey}
              className={cn(
                'transition-all duration-200',
                hoveredRegion === regionKey ? 'transform scale-105' : ''
              )}
              onMouseEnter={() => setHoveredRegion(regionKey as RegionKey)}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              <h3
                className={cn(
                  'text-lg font-medium mb-2 transition-colors duration-200',
                  hoveredRegion === regionKey ? 'text-orange-500' : 'text-gray-900'
                )}
              >
                {displayName}
              </h3>
              
              {regionLocations.length > 0 ? (
                <div className="space-y-1">
                  {regionLocations.map((location) => (
                    <Link
                      key={location.sys.id}
                      href={`/locations/${location.slug}`}
                      className="block text-sm text-gray-600 hover:text-orange-500 transition-colors"
                    >
                      {location.address}
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
