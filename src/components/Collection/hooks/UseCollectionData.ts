import { useEffect, useState } from 'react';
import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { getCollectionById } from '@/components/Collection/CollectionApi';

import type { Collection } from '@/components/Collection/CollectionSchema';

interface UseCollectionDataProps {
  collectionData?: Collection;
  sys?: {
    id: string;
  };
  preview?: boolean;
}

export function useCollectionData({
  collectionData,
  sys,
  preview = false
}: UseCollectionDataProps) {
  const [collection, setCollection] = useState<Collection | null>(collectionData ?? null);
  const [isLoading, setIsLoading] = useState(!collectionData && !!sys?.id);
  const [error, setError] = useState<string | null>(null);

  // Contentful Live Preview integration
  const updatedCollection = useContentfulLiveUpdates(collection);

  // Fetch collection data if not provided but sys.id is available
  useEffect(() => {
    if (!collectionData && sys?.id) {
      const fetchCollection = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const fetchedCollection = await getCollectionById(sys.id, preview);
          setCollection(fetchedCollection);
        } catch {
          setError('Failed to load collection');
        } finally {
          setIsLoading(false);
        }
      };

      void fetchCollection();
    }
  }, [collectionData, sys?.id, preview]);

  const finalCollection = updatedCollection ?? collection;

  return {
    collection: finalCollection,
    isLoading,
    error,
    setCollection
  };
}
