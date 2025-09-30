import { useEffect, useState } from 'react';

import { getAllServices } from '@/components/Service/ServiceApi';

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

  // Fetch services when collection content type includes "Service"
  useEffect(() => {
    if (finalCollection?.contentType?.includes('Service')) {
      const fetchServices = async () => {
        try {
          setIsLoading(true);
          const servicesResponse = await getAllServices();
          setServices(servicesResponse.items ?? []);
        } catch (error) {
          console.error('Error fetching services:', error);
        } finally {
          setIsLoading(false);
        }
      };

      void fetchServices();
    }
  }, [finalCollection]);

  return {
    services,
    isLoading,
    setServices
  };
}
