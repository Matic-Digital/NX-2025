'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

// Import removed - using API route instead

import type { Event } from '@/components/Event/EventSchema';

export function useEventData(eventId?: string, initialData?: Event) {
  // Check if we have server-enriched data (has more than just sys and __typename)
  const hasServerData = initialData && Object.keys(initialData).length > 3;
  
  const [fetchedData, setFetchedData] = useState<Event | null>(null);
  const [loading, setLoading] = useState(!!eventId && !hasServerData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we have server-enriched data, don't fetch client-side
    if (hasServerData) {
      setLoading(false);
      return;
    }

    if (!eventId) {
      setLoading(false);
      return;
    }

    async function fetchEventData() {
      try {
        setLoading(true);
        setError(null);
        // Use API route to get server-side enriched Event
        const response = await fetch(`/api/components/Event/${eventId}`);
        if (response.ok) {
          const responseData = await response.json();
          const data = responseData.event;
          setFetchedData(data);
        } else {
          throw new Error('Failed to fetch event from API');
        }
      } catch {
        setError('Failed to load event data');
      } finally {
        setLoading(false);
      }
    }

    void fetchEventData();
  }, [eventId, hasServerData]);

  const event = useContentfulLiveUpdates(fetchedData ?? initialData);

  const inspectorProps = useContentfulInspectorMode({ entryId: event?.sys?.id });

  return { event, loading, error, inspectorProps };
}
