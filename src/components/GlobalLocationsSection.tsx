'use client';

import { useEffect, useState } from 'react';
import { InteractiveWorldMap } from './InteractiveWorldMap';
import { getAllGlobalLocations } from '@/lib/contentful-api/global-locations';
import type { GlobalLocation } from '@/types/contentful/GlobalLocation';

interface GlobalLocationsSectionProps {
  title?: string;
  overline?: string;
}

export function GlobalLocationsSection({ 
  title = "Excepteur sint occaecat cupidatat non proident",
  overline = "GLOBAL LOCATIONS" 
}: GlobalLocationsSectionProps) {
  const [locations, setLocations] = useState<GlobalLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const data = await getAllGlobalLocations();
        
        if (data?.items) {
          setLocations(data.items);
        } else {
          setError('No locations found');
        }
      } catch (err) {
        console.error('Error fetching global locations:', err);
        setError('Failed to load locations');
      } finally {
        setLoading(false);
      }
    };

    void fetchLocations();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-lg text-gray-600">Loading global locations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <InteractiveWorldMap
      title={title}
      overline={overline}
      locations={locations}
    />
  );
}
