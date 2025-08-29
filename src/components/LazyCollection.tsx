'use client';

import { useEffect, useState } from 'react';
import Collection from '@/components/Collection';
import { getCollectionById } from '@/lib/contentful-api/collection';
import type { Collection as CollectionType } from '@/types/contentful/Collection';

interface LazyCollectionProps {
  collectionId: string;
}

export function LazyCollection({ collectionId }: LazyCollectionProps) {
  const [collection, setCollection] = useState<CollectionType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCollection() {
      try {
        setLoading(true);
        const data = await getCollectionById(collectionId);
        setCollection(data);
      } catch (err) {
        console.error('Failed to fetch collection:', err);
        setError('Failed to load collection');
      } finally {
        setLoading(false);
      }
    }

    void fetchCollection();
  }, [collectionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading collection...</div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">{error ?? 'Collection not found'}</div>
      </div>
    );
  }

  return <Collection key={`lazy-loaded-${collectionId}`} {...collection} />;
}
