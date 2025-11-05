import { useEffect, useState } from 'react';

// Import removed - using API route instead

import type { Collection } from '@/components/Collection/CollectionSchema';
import type { PageList } from '@/components/PageList/PageListSchema';

interface UsePageListsDataProps {
  collection: Collection | null;
  collectionData?: Collection;
}

export function usePageListsData({ collection, collectionData }: UsePageListsDataProps) {
  const [pageLists, setPageLists] = useState<PageList[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const finalCollection = collection ?? collectionData;
  
  // Check if we have server-enriched collection data
  const hasServerData = finalCollection && Object.keys(finalCollection).length > 3;

  // Fetch page lists when collection content type includes "Page" - but only if we have server-enriched Collection config
  useEffect(() => {
    if (!hasServerData) {
      console.warn('Collection missing server-side data - showing skeleton. Collection ID:', finalCollection?.sys?.id);
      setIsLoading(false);
      return;
    }

    if (finalCollection?.contentType?.includes('Page')) {
      const fetchPageLists = async () => {
        try {
          setIsLoading(true);
          // Use API route to get server-side enriched PageLists
          const response = await fetch('/api/components/PageList/all');
          if (response.ok) {
            const data = await response.json();
            setPageLists(data.pageLists?.items ?? []);
          } else {
            throw new Error('Failed to fetch page lists from API');
          }
        } catch (error) {
          console.warn('Collection: Error fetching page lists:', error);
        } finally {
          setIsLoading(false);
        }
      };

      void fetchPageLists();
    } else {
      setIsLoading(false);
    }
  }, [finalCollection, hasServerData]);

  return {
    pageLists,
    isLoading,
    setPageLists
  };
}
