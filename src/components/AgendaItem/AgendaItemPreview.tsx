'use client';

import { useContentfulInspectorMode, useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { formatDate } from '@/lib/utils';

import { AgendaItem } from '@/components/AgendaItem/AgendaItem';

import type { AgendaItem as AgendaItemType } from '@/components/AgendaItem/AgendaItemSchema';

interface AgendaItemPreviewProps {
  agendaItem: AgendaItemType;
}

export function AgendaItemPreview({ agendaItem: initialAgendaItem }: AgendaItemPreviewProps) {
  const inspectorProps = useContentfulInspectorMode();
  const agendaItem = useContentfulLiveUpdates(initialAgendaItem);

  if (!agendaItem) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Agenda Item Preview</h2>
          <p className="text-muted-foreground">No agenda item data available</p>
        </div>
      </div>
    );
  }

  const formattedTime = formatDate(agendaItem.time, true);

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      {/* Preview Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold mb-2">Agenda Item Preview</h1>
        <p className="text-muted-foreground">
          Preview how this agenda item will appear in event schedules
        </p>
      </div>

      {/* Field Breakdown */}
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Title (Required)</label>
          <h2 
            className="text-xl font-semibold"
            {...inspectorProps({ fieldId: 'title' })}
          >
            {agendaItem.title}
          </h2>
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-medium mb-2">Time (Required)</label>
          <time 
            className="text-lg text-muted-foreground font-medium"
            dateTime={agendaItem.time}
            {...inspectorProps({ fieldId: 'time' })}
          >
            {formattedTime}
          </time>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description (Required)</label>
          <p 
            className="text-muted-foreground leading-relaxed"
            {...inspectorProps({ fieldId: 'description' })}
          >
            {agendaItem.description}
          </p>
        </div>
      </div>

      {/* Live Preview */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
        <div className="border rounded-lg p-6 bg-muted/20">
          <AgendaItem agendaItem={agendaItem} />
        </div>
      </div>
    </div>
  );
}
