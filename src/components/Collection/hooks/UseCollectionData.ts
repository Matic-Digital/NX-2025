import { useEffect, useState } from 'react';
import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { getCollectionById } from '@/components/Collection/CollectionApi';
import type { Collection } from '@/components/Collection/CollectionSchema';

interface UseCollectionDataProps {
  collectionData?: Collection;
  sys?: {
    id: string;
  };
}

export function useCollectionData({ collectionData, sys }: UseCollectionDataProps) {
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
          const fetchedCollection = await getCollectionById(sys.id);
          setCollection(fetchedCollection);
        } catch (err) {
          console.error('Failed to fetch collection:', err);
          setError('Failed to load collection');
        } finally {
          setIsLoading(false);
        }
      };

      void fetchCollection();
    }
  }, [collectionData, sys?.id]);

  const finalCollection = updatedCollection ?? collection;

  return {
    collection: finalCollection,
    isLoading,
    error,
    setCollection,
  };
}
