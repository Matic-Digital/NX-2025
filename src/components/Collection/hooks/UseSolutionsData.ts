import { useEffect, useState } from 'react';

import { getAllSolutions } from '@/components/Solution/SolutionApi';

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

  // Fetch solutions when collection content type is "Solution"
  useEffect(() => {
    if (finalCollection?.contentType?.includes('Solution')) {
      const fetchSolutions = async () => {
        try {
          setIsLoading(true);
          const solutionsResponse = await getAllSolutions();
          setSolutions(solutionsResponse ?? []);
        } catch (error) {
          console.error('Error fetching solutions:', error);
        } finally {
          setIsLoading(false);
        }
      };

      void fetchSolutions();
    }
  }, [finalCollection]);

  return {
    solutions,
    isLoading,
    setSolutions
  };
}
