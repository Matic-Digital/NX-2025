'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { ArrowUpRight } from 'lucide-react';

import { formatDateRange } from '@/lib/utils';

import { Button } from '@/components/ui/button';

import { Box } from '@/components/global/matic-ds';

import { EmptyState, ErrorState, LoadingState } from '@/components/Event/components/EventStates';

import type { Event as EventType } from '@/components/Event/EventSchema';

interface EventProps extends EventType {
  eventId?: string;
}

export function Event(props: EventProps) {
  const { eventId, ...eventData } = props;
  
  // Check if we have server-enriched data (actual Event properties, not just metadata)
  const hasServerData = eventData && (
    eventData.title || 
    eventData.slug || 
    eventData.dateTime 
  );
  
  const [fetchedData, setFetchedData] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(!!eventId && !hasServerData);
  const [error, setError] = useState<string | null>(null);

  // Debug logging for Event data
  console.warn('[Event] Component rendering:', {
    hasEventId: !!eventId,
    hasServerData,
    eventDataKeys: eventData ? Object.keys(eventData) : [],
    eventTitle: eventData?.title,
    eventSlug: eventData?.slug,
    eventDateTime: eventData?.dateTime,
    fullEventData: eventData,
    willFetchClientSide: !!eventId && !hasServerData
  });

  useEffect(() => {
    // If we have server-enriched data, don't fetch client-side
    if (hasServerData) {
      console.warn('[Event] Using server-provided data, skipping client fetch');
      setLoading(false);
      return;
    }

    if (!eventId) {
      setLoading(false);
      return;
    }

    console.warn('[Event] Server data insufficient, fetching client-side for eventId:', eventId);

    async function fetchEventData() {
      try {
        setLoading(true);
        setError(null);
        // Use API route to get server-side enriched Event
        const response = await fetch(`/api/components/Event/${eventId}`);
        if (response.ok) {
          const responseData = await response.json();
          const data = responseData.event;
          console.warn('[Event] Client fetch successful:', { hasTitle: !!data?.title });
          setFetchedData(data);
        } else {
          throw new Error('Failed to fetch event from API');
        }
      } catch (fetchError) {
        console.warn('[Event] Client fetch failed:', fetchError);
        setError('Failed to load event data');
      } finally {
        setLoading(false);
      }
    }

    void fetchEventData();
  }, [eventId, hasServerData]);

  // Use Live Preview for real-time updates
  const event = useContentfulLiveUpdates(fetchedData ?? (hasServerData ? eventData : null));
  const inspectorProps = useContentfulInspectorMode({ entryId: event?.sys?.id });

  if (loading) {
    console.warn('[Event] Showing loading state');
    return <LoadingState />;
  }

  if (error) {
    console.warn('[Event] Showing error state:', error);
    return <ErrorState message={error} />;
  }

  if (!event) {
    console.warn('[Event] No event data, showing empty state');
    return <EmptyState />;
  }

  console.warn('[Event] Rendering event:', { title: event.title, slug: event.slug });

  return (
    <Link href={`/events/${event.slug ?? ''}`} className="block w-full">
      <Box
        direction={{ base: 'col', lg: 'row' }}
        gap={{ base: 4, lg: 24 }}
        className="group relative w-full hover:bg-primary p-6 lg:py-12 lg:px-8 text-text-subtle hover:text-text-on-invert items-start lg:border-b-2 lg:hover:border-transparent bg-surface lg:bg-transparent cursor-pointer"
        {...inspectorProps}
      >
        <div className="text-xs text-[#9A9A9A] group-hover:text-text-on-invert">
          {formatDateRange(event.dateTime ?? '', event.endDateTime ?? undefined, true)}
        </div>
        <Box direction="col" gap={1}>
          <h5 className="uppercase text-text-body-xs text-text-primary-active group-hover:text-text-on-invert">
            Event
          </h5>
          <div className="text-2xl">{event.title ?? ''}</div>
          <Button variant="white" className="mt-4 flex lg:hidden">
            See Details
          </Button>
        </Box>
        <div className="hidden group-hover:flex items-center justify-center absolute top-0 right-0 bg-white text-black p-2">
          <ArrowUpRight className="size-10" />
        </div>
      </Box>
    </Link>
  );
}
