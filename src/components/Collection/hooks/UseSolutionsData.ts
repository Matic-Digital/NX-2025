import { useEffect, useState } from 'react';

// Import removed - using API route instead

import type { Collection } from '@/components/Collection/CollectionSchema';
import type { Solution } from '@/components/Solution/SolutionSchema';

interface UseSolutionsDataProps {
  collection: Collection | null;
  collectionData?: Collection;
}

export function useSolutionsData({ collection, collectionData }: UseSolutionsDataProps) {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const finalCollection = collection ?? collectionData;

  // Check if we have server-enriched collection data
  const hasServerData = finalCollection && Object.keys(finalCollection).length > 3;

  // Fetch solutions when collection content type includes "Solution" - but only if we have server-enriched Collection config
  useEffect(() => {
    if (!hasServerData) {
      console.warn('Collection missing server-side data - showing skeleton. Collection ID:', finalCollection?.sys?.id);
      setIsLoading(false);
      return;
    }

    if (finalCollection?.contentType?.includes('Solution')) {
      const fetchSolutions = async () => {
        try {
          setIsLoading(true);
          // Use API route to get server-side enriched Solutions
          const response = await fetch('/api/components/Solution/all');
          if (response.ok) {
            const data = await response.json();
            setSolutions(data.solutions ?? []);
          } else {
            throw new Error('Failed to fetch solutions from API');
          }
        } catch (error) {
          console.warn('Collection: Error fetching solutions:', error);
        } finally {
          setIsLoading(false);
        }
      };

      void fetchSolutions();
    } else {
      setIsLoading(false);
    }
  }, [finalCollection, hasServerData]);

  return {
    solutions,
    isLoading,
    setSolutions
  };
}
