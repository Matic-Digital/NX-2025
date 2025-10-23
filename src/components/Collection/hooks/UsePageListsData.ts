import { useEffect, useState } from 'react';

import { getAllPageLists } from '@/components/PageList/PageListApi';

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

  // Fetch page lists when collection content type includes "Page" (since we want PageLists with Pages)
  useEffect(() => {
    if (finalCollection?.contentType?.includes('Page')) {
      const fetchPageLists = async () => {
        try {
          setIsLoading(true);
          const pageListsResponse = await getAllPageLists();
          setPageLists(pageListsResponse.items ?? []);
        } catch {
        } finally {
          setIsLoading(false);
        }
      };

      void fetchPageLists();
    }
  }, [finalCollection]);

  return {
    pageLists,
    isLoading,
    setPageLists
  };
}
