'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { getEventById } from '@/components/Event/EventApi';

import type { Event } from '@/components/Event/EventSchema';

export function useEventData(eventId?: string, initialData?: Event) {
  const [fetchedData, setFetchedData] = useState<Event | null>(null);
  const [loading, setLoading] = useState(!!eventId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    async function fetchEventData() {
      try {
        setLoading(true);
        setError(null);
        const data = await getEventById(eventId ?? '');
        setFetchedData(data);
      } catch {
        setError('Failed to load event data');
      } finally {
        setLoading(false);
      }
    }

    void fetchEventData();
  }, [eventId]);

  const event = useContentfulLiveUpdates(fetchedData ?? initialData);

  const inspectorProps = useContentfulInspectorMode({ entryId: event?.sys?.id });

  return { event, loading, error, inspectorProps };
}
