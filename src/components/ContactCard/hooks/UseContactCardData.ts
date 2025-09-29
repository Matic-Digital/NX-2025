'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { getContactCardById } from '@/components/ContactCard/ContactCardApi';

import type { ContactCard } from '@/components/ContactCard/ContactCardSchema';

/**
 * Custom hook for ContactCard data fetching and Contentful integration
 */
export function useContactCardData(contactCardId?: string, initialData?: Partial<ContactCard>) {
  const [fetchedData, setFetchedData] = useState<ContactCard | null>(null);
  const [loading, setLoading] = useState(!!contactCardId);
  const [error, setError] = useState<string | null>(null);

  // Fetch data if contactCardId is provided
  useEffect(() => {
    if (!contactCardId) {
      setLoading(false);
      return;
    }

    async function fetchContactCard() {
      try {
        setLoading(true);
        setError(null);
        const data = await getContactCardById(contactCardId ?? '');
        setFetchedData(data);
      } catch (err) {
        console.error('Failed to fetch contact card:', err);
        setError(err instanceof Error ? err.message : 'Failed to load contact card');
      } finally {
        setLoading(false);
      }
    }

    void fetchContactCard();
  }, [contactCardId]);

  // Use fetched data if available, otherwise use initial data
  const contactCard = useContentfulLiveUpdates(fetchedData ?? initialData);

  // Get inspector props for Contentful live preview
  const inspectorProps = useContentfulInspectorMode({ entryId: contactCard?.sys?.id });

  return {
    contactCard,
    loading,
    error,
    inspectorProps
  };
}
