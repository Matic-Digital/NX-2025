import { useEffect, useState } from 'react';
import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

// Import removed - using API route instead

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

  // Check if we have server-enriched collection data
  const hasServerData = collectionData && Object.keys(collectionData).length > 3;

  // Use server-enriched Collection data when available, otherwise fetch
  useEffect(() => {
    if (hasServerData) {
      setCollection(collectionData);
      setIsLoading(false);
      return;
    }

    // If no server data but we have an ID, fetch the Collection config
    if (!collectionData && sys?.id) {
      const fetchCollection = async () => {
        try {
          setIsLoading(true);
          setError(null);
          // Use API route to get server-side enriched Collection
          const response = await fetch(`/api/components/Collection/${sys.id}`);
          if (response.ok) {
            const data = await response.json();
            const fetchedCollection = data.collection;
            setCollection(fetchedCollection);
          } else {
            throw new Error('Failed to fetch collection from API');
          }
        } catch {
          setError('Failed to load collection');
        } finally {
          setIsLoading(false);
        }
      };

      void fetchCollection();
    } else {
      setIsLoading(false);
    }
  }, [collectionData, sys?.id, hasServerData, preview]);

  const finalCollection = updatedCollection ?? collection;

  return {
    collection: finalCollection,
    isLoading,
    error,
    setCollection
  };
}
