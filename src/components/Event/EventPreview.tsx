'use client';

import { useContentfulInspectorMode, useContentfulLiveUpdates } from '@contentful/live-preview/react';
import Image from 'next/image';

import { formatDateRange } from '@/lib/utils';

import { AgendaList } from '@/components/AgendaItem/AgendaItem';

import type { Event } from '@/components/Event/EventSchema';

interface EventPreviewProps {
  event: Event;
}

export function EventPreview({ event: initialEvent }: EventPreviewProps) {
  const inspectorProps = useContentfulInspectorMode();
  const event = useContentfulLiveUpdates(initialEvent);

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Event Preview</h2>
          <p className="text-muted-foreground">No event data available</p>
        </div>
      </div>
    );
  }

  const formattedDateTime = formatDateRange(event.dateTime ?? '', event.endDateTime ?? undefined, true);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      {/* Preview Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold mb-2">Event Preview</h1>
        <p className="text-muted-foreground">
          Template: <span className="font-medium">{event.template ?? ''}</span>
        </p>
      </div>

      {/* Event Details */}
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Title (Required)</label>
          <h2 
            className="text-2xl font-bold"
            {...inspectorProps({ fieldId: 'title' })}
          >
            {event.title ?? ''}
          </h2>
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium mb-2">Slug (Required)</label>
          <p 
            className="text-muted-foreground font-mono"
            {...inspectorProps({ fieldId: 'slug' })}
          >
            /events/{event.slug ?? ''}
          </p>
        </div>

        {/* Date & Time */}
        <div>
          <label className="block text-sm font-medium mb-2">Date & Time (Required)</label>
          <div className="flex items-center gap-3">
            {event.dateIcon && (
              <div {...inspectorProps({ fieldId: 'dateIcon' })}>
                <Image 
                  src={event.dateIcon.url ?? ''}
                  alt={event.dateIcon.description ?? 'Date icon'}
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </div>
            )}
            <time 
              className="text-lg"
              dateTime={event.dateTime ?? ''}
              {...inspectorProps({ fieldId: 'dateTime' })}
            >
              {formattedDateTime}
            </time>
          </div>
        </div>

        {/* Address */}
        {(event.address ?? event.addressSubline) && (
          <div>
            <label className="block text-sm font-medium mb-2">Address (Optional)</label>
            <div className="flex items-start gap-3">
              {event.addressIcon && (
                <div {...inspectorProps({ fieldId: 'addressIcon' })}>
                  <Image 
                    src={event.addressIcon.url ?? ''}
                    alt={event.addressIcon.description ?? 'Address icon'}
                    width={24}
                    height={24}
                    className="w-6 h-6 mt-1"
                  />
                </div>
              )}
              <div>
                {event.address && (
                  <div 
                    className="text-lg"
                    {...inspectorProps({ fieldId: 'address' })}
                  >
                    {event.address ?? ''}
                  </div>
                )}
                {event.addressSubline && (
                  <div 
                    className="text-muted-foreground"
                    {...inspectorProps({ fieldId: 'addressSubline' })}
                  >
                    {event.addressSubline ?? ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Template */}
        <div>
          <label className="block text-sm font-medium mb-2">Template (Required)</label>
          <p 
            className="px-3 py-1 bg-primary/10 text-primary rounded-full inline-block text-sm"
            {...inspectorProps({ fieldId: 'template' })}
          >
            {event.template ?? ''}
          </p>
        </div>

        {/* Agenda Section (if template is Agenda) */}
        {event.template === 'Agenda' && (
          <div className="space-y-4">
            {event.agendaHeadline && (
              <div>
                <label className="block text-sm font-medium mb-2">Agenda Headline (Optional)</label>
                <h3 
                  className="text-xl font-semibold"
                  {...inspectorProps({ fieldId: 'agendaHeadline' })}
                >
                  {event.agendaHeadline ?? ''}
                </h3>
              </div>
            )}

            {event.agendaItemsCollection?.items && event.agendaItemsCollection.items.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Agenda Items (Optional) - {event.agendaItemsCollection.items.length} items
                </label>
                <div 
                  className="border rounded-lg p-4"
                  {...inspectorProps({ fieldId: 'agendaItemsCollection' })}
                >
                  <AgendaList agendaItems={event.agendaItemsCollection?.items ?? []} />
                </div>
              </div>
            )}

            {event.agendaFooter && (
              <div>
                <label className="block text-sm font-medium mb-2">Agenda Footer (Optional)</label>
                <p 
                  className="text-muted-foreground"
                  {...inspectorProps({ fieldId: 'agendaFooter' })}
                >
                  {event.agendaFooter ?? ''}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Main Image */}
        {event.mainImage && (
          <div>
            <label className="block text-sm font-medium mb-2">Main Image (Required)</label>
            <div 
              className="border rounded-lg p-4"
              {...inspectorProps({ fieldId: 'mainImage' })}
            >
              <Image 
                src={event.mainImage.link ?? ''}
                alt={event.mainImage.altText ?? event.mainImage.title ?? 'Main image'}
                width={400}
                height={300}
                className="w-full max-w-md h-auto rounded"
              />
              {event.mainImageCaption && (
                <p 
                  className="text-sm text-muted-foreground mt-2"
                  {...inspectorProps({ fieldId: 'mainImageCaption' })}
                >
                  {event.mainImageCaption ?? ''}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Banner Image */}
        {event.bannerImage && (
          <div>
            <label className="block text-sm font-medium mb-2">Banner Image (Optional)</label>
            <div 
              className="border rounded-lg p-4"
              {...inspectorProps({ fieldId: 'bannerImage' })}
            >
              <Image 
                src={event.bannerImage.link ?? ''}
                alt={event.bannerImage.altText ?? event.bannerImage.title ?? 'Banner image'}
                width={400}
                height={200}
                className="w-full max-w-md h-auto rounded"
              />
            </div>
          </div>
        )}

        {/* Contact Location */}
        {event.contactLocation && (
          <div>
            <label className="block text-sm font-medium mb-2">Contact Location (Optional)</label>
            <p 
              className="px-3 py-1 bg-secondary/10 text-secondary-foreground rounded-full inline-block text-sm"
              {...inspectorProps({ fieldId: 'contactLocation' })}
            >
              {event.contactLocation ?? ''}
            </p>
          </div>
        )}

        {/* Layout */}
        {event.layout && (
          <div>
            <label className="block text-sm font-medium mb-2">Layout (Optional)</label>
            <div 
              className="border rounded-lg p-4"
              {...inspectorProps({ fieldId: 'layout' })}
            >
              <p className="text-sm">
                <span className="font-medium">Layout ID:</span> {event.layout?.sys?.id ?? ''}
              </p>
              <p className="text-sm text-muted-foreground">
                Header and footer will be rendered from this layout
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
