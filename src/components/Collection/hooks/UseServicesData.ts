import { useEffect, useState } from 'react';

// Import removed - using API route instead

import type { Collection } from '@/components/Collection/CollectionSchema';
import type { Service } from '@/components/Service/ServiceSchema';

interface UseServicesDataProps {
  collection: Collection | null;
  collectionData?: Collection;
}

export function useServicesData({ collection, collectionData }: UseServicesDataProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const finalCollection = collection ?? collectionData;
  
  // Check if we have server-enriched collection data
  const hasServerData = finalCollection && Object.keys(finalCollection).length > 3;

  // Fetch services when collection content type includes "Service" - but only if we have server-enriched Collection config
  useEffect(() => {
    if (!hasServerData) {
      console.warn('Collection missing server-side data - showing skeleton. Collection ID:', finalCollection?.sys?.id);
      setIsLoading(false);
      return;
    }

    if (finalCollection?.contentType?.includes('Service')) {
      const fetchServices = async () => {
        try {
          setIsLoading(true);
          // Use API route to get server-side enriched Services
          const response = await fetch('/api/components/Service/all');
          if (response.ok) {
            const data = await response.json();
            setServices(data.services?.items ?? []);
          } else {
            throw new Error('Failed to fetch services from API');
          }
        } catch (error) {
          console.warn('Collection: Error fetching services:', error);
        } finally {
          setIsLoading(false);
        }
      };

      void fetchServices();
    } else {
      setIsLoading(false);
    }
  }, [finalCollection, hasServerData]);

  return {
    services,
    isLoading,
    setServices
  };
}
