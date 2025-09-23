'use client';

import React, { useEffect, useState } from 'react';

import { Box } from '@/components/global/matic-ds';

import { AirImage } from '@/components/Image/AirImage';
import { getLocationById } from '@/components/OfficeLocation/OfficeLocationApi';

import type { OfficeLocation } from '@/types';

interface LocationProps {
  sys: {
    id: string;
  };
  variant?: string;
}

export const Location: React.FC<LocationProps> = ({ sys, variant }: LocationProps) => {
  const [location, setLocation] = useState<OfficeLocation | null>(null);
  const [isLoading, setIsLoading] = useState(!!sys?.id);

  // Fetch location data using sys.id
  useEffect(() => {
    if (sys?.id) {
      const fetchLocation = async () => {
        try {
          setIsLoading(true);
          const fetchedLocation = await getLocationById(sys.id);
          setLocation(fetchedLocation);
        } catch (error) {
          console.error('Error fetching location:', error);
        } finally {
          setIsLoading(false);
        }
      };

      void fetchLocation();
    }
  }, [sys.id]);

  if (isLoading) {
    return <div>Loading location...</div>;
  }

  if (!location) {
    return null;
  }

  const { image, country, city, state, address, phone } = location;

  // Featured variant - larger layout for the first location
  if (variant === 'featured') {
    return (
      <Box direction="col" gap={0}>
        {image && <AirImage {...image} className="h-64 w-full object-cover" />}

        <Box direction="col" gap={4} className="bg-subtle p-8">
          <h2 className="text-2xl font-bold">{country} Headquarters</h2>
          <h3 className="text-xl font-semibold text-gray-700">
            {city}
            {state ? `, ${state}` : ''}
          </h3>

          <Box gap={2} className="flex-col justify-between text-base text-gray-600 md:flex-row">
            <p>{address}</p>
            {phone && <p className="font-medium text-orange-500">{phone}</p>}
          </Box>
        </Box>
      </Box>
    );
  }

  // Grid variant - smaller layout for remaining locations
  if (variant === 'grid') {
    return (
      <Box direction="col" gap={0}>
        {image && <AirImage {...image} className="h-40 w-full object-cover" />}

        <Box direction="col" gap={2} className="bg-subtle p-8">
          <h3 className="text-lg font-semibold">{country}</h3>
          <h4 className="text-base font-medium text-gray-700">
            {city}
            {state ? `, ${state}` : ''}
          </h4>

          <Box direction="col" gap={1} className="text-sm text-gray-600">
            <p>{address}</p>
            {phone && <p className="font-medium text-orange-500">{phone}</p>}
          </Box>
        </Box>
      </Box>
    );
  }

  // Default variant - original layout
  return (
    <Box direction="col" gap={4} className="rounded-lg border border-gray-200 p-6">
      {image && (
        <Box className="mb-4">
          <AirImage {...image} />
        </Box>
      )}

      <Box direction="col" gap={2}>
        <h3 className="text-lg font-semibold">
          {city}
          {state ? `, ${state}` : ''}, {country}
        </h3>

        <Box direction="col" gap={1} className="text-sm text-gray-600">
          <p>{address}</p>
          <p>{phone}</p>
        </Box>
      </Box>
    </Box>
  );
};
