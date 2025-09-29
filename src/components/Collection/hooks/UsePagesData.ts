import { useEffect, useState } from 'react';

import { getAllPagesMinimal } from '@/components/Page/PageApi';

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

  // Fetch pages when collection content type is "Page"
  useEffect(() => {
    if (finalCollection?.contentType?.includes('Page')) {
      const fetchPages = async () => {
        try {
          setIsLoading(true);
          const pagesResponse = await getAllPagesMinimal();
          setPages(pagesResponse.items ?? []);
        } catch (error) {
          console.error('Error fetching pages:', error);
        } finally {
          setIsLoading(false);
        }
      };

      void fetchPages();
    }
  }, [finalCollection]);

  return {
    pages,
    isLoading,
    setPages
  };
}
