'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { Event } from '@/components/Event/Event';
import { eventFields } from '@/components/Event/preview/EventFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { Event as EventType } from '@/components/Event/EventSchema';

/**
 * This component is used in Contentful Live Preview to display Event components
 * with a live preview and field breakdown.
 */
export function EventPreview(props: Partial<EventType>) {
  // Contentful Live Preview integration
  const liveEvent = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveEvent?.sys?.id });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Live Component Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Event
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid Event
                const hasRequiredFields =
                  liveEvent?.sys && liveEvent?.title && liveEvent?.dateTime && liveEvent?.link;

                if (hasRequiredFields) {
                  return (
                    <div className="overflow-hidden">
                      <Event {...(liveEvent as EventType)} {...inspectorProps} />
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!liveEvent?.title && <li>• Title is required</li>}
                      {!liveEvent?.dateTime && <li>• Date & Time is required</li>}
                      {!liveEvent?.link && <li>• Link is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={eventFields} data={liveEvent} />
        </div>
      </div>
    </div>
  );
}
