'use client';

import Link from 'next/link';

import { ArrowUpRight } from 'lucide-react';

import { formatDate } from '@/lib/utils';

import { Button } from '@/components/ui/button';

import { Box } from '@/components/global/matic-ds';

import { EmptyState, ErrorState, LoadingState } from '@/components/Event/components/EventStates';
import { useEventData } from '@/components/Event/hooks/UseEventData';

import type { Event } from '@/components/Event/EventSchema';

interface EventProps extends Event {
  eventId?: string;
}

export function Event(props: EventProps) {
  const { eventId } = props;
  const { event, loading, error, inspectorProps } = useEventData(eventId);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!event) {
    return <EmptyState />;
  }

  return (
    <Box
      direction={{ base: 'col', lg: 'row' }}
      gap={{ base: 4, lg: 24 }}
      className="group relative w-full hover:bg-primary p-6 lg:py-12 lg:px-8 text-text-subtle hover:text-text-on-invert items-start lg:border-b-2 lg:hover:border-transparent bg-surface lg:bg-transparent"
      {...inspectorProps}
    >
      <div className="text-xs text-[#9A9A9A] group-hover:text-text-on-invert">{formatDate(event.dateTime, true)}</div>
      <Box direction="col" gap={1}>
        <h5 className="uppercase text-text-body-xs text-text-primary-active group-hover:text-text-on-invert">
          Event
        </h5>
        <div className="text-2xl">{event.title}</div>
        <Button variant="white" className="mt-4 flex lg:hidden">
          <Link href={event.link}>See Details</Link>
        </Button>
      </Box>
      <div className="hidden group-hover:flex items-center justify-center absolute top-0 right-0 bg-white text-black p-2">
        <ArrowUpRight className="size-10" />
      </div>
    </Box>
  );
}
