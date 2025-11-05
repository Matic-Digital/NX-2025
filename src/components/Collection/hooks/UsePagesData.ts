import { useEffect, useState } from 'react';

// Import removed - using API route instead

import type { Collection } from '@/components/Collection/CollectionSchema';
import type { Page } from '@/components/Page/PageSchema';

interface UsePagesDataProps {
  collection: Collection | null;
  collectionData?: Collection;
}

export function usePagesData({ collection, collectionData }: UsePagesDataProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const finalCollection = collection ?? collectionData;
  
  // Check if we have server-enriched collection data
  const hasServerData = finalCollection && Object.keys(finalCollection).length > 3;

  // Fetch pages when collection content type is "Page" - but only if we have server-enriched Collection config
  useEffect(() => {
    if (!hasServerData) {
      console.warn('Collection missing server-side data - showing skeleton. Collection ID:', finalCollection?.sys?.id);
      setIsLoading(false);
      return;
    }

    if (finalCollection?.contentType?.includes('Page')) {
      const fetchPages = async () => {
        try {
          setIsLoading(true);
          // Use API route to get server-side enriched Pages
          const response = await fetch('/api/components/Page/all');
          if (response.ok) {
            const data = await response.json();
            setPages(data.pages?.items ?? []);
          } else {
            throw new Error('Failed to fetch pages from API');
          }
        } catch (error) {
          console.warn('Collection: Error fetching pages:', error);
        } finally {
          setIsLoading(false);
        }
      };

      void fetchPages();
    } else {
      setIsLoading(false);
    }
  }, [finalCollection, hasServerData]);

  return {
    pages,
    isLoading,
    setPages
  };
}
