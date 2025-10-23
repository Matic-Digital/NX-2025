'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { Event } from '@/components/Event/Event';
import { EventDetail } from '@/components/Event/EventDetail';
import { eventFields } from '@/components/Event/preview/EventFields';
import { getFooterById } from '@/components/Footer/FooterApi';
import { getHeaderById } from '@/components/Header/HeaderApi';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { Event as EventType } from '@/components/Event/EventSchema';
import type { Footer } from '@/components/Footer/FooterSchema';
import type { Header } from '@/components/Header/HeaderSchema';

type PreviewMode = 'card' | 'detail';

/**
 * This component is used in Contentful Live Preview to display Event components
 * with a live preview and field breakdown.
 */
export function EventPreview(props: Partial<EventType>) {
  // Contentful Live Preview integration
  const liveEvent = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveEvent?.sys?.id });

  // Toggle state for preview mode
  const [previewMode, setPreviewMode] = useState<PreviewMode>('detail');

  // State for header and footer
  const [header, setHeader] = useState<Header | null>(null);
  const [footer, setFooter] = useState<Footer | null>(null);
  const [isLoadingLayout, setIsLoadingLayout] = useState(false);

  // Fetch header and footer when event layout changes
  useEffect(() => {
    const fetchLayout = async () => {
      if (!liveEvent?.layout) {
        setHeader(null);
        setFooter(null);
        return;
      }

      setIsLoadingLayout(true);
      try {
        const pageLayout = liveEvent.layout as {
          header?: { sys?: { id: string } };
          footer?: { sys?: { id: string } };
        };

        // Fetch header and footer in parallel
        const [headerData, footerData] = await Promise.all([
          pageLayout.header?.sys?.id ? getHeaderById(pageLayout.header.sys.id, true) : null,
          pageLayout.footer?.sys?.id ? getFooterById(pageLayout.footer.sys.id, true) : null
        ]);

        setHeader(headerData);
        setFooter(footerData);
      } catch {
        setHeader(null);
        setFooter(null);
      } finally {
        setIsLoadingLayout(false);
      }
    };

    void fetchLayout();
  }, [liveEvent?.layout]);

  // Check if we have all required fields for a valid Event
  const hasRequiredFields =
    liveEvent?.sys && liveEvent?.title && liveEvent?.dateTime && liveEvent?.slug;

  return (
    <div className="min-h-screen relative">
      {/* Floating toggle button - always visible */}
      <div className="fixed top-4 right-4 z-[9999] pointer-events-auto">
        <div className="flex bg-white rounded-lg border border-gray-300 shadow-lg p-1">
          <button
            onClick={() => setPreviewMode('card')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              (previewMode as string) === 'card'
                ? 'bg-purple-100 text-purple-800'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Event
          </button>
          <button
            onClick={() => setPreviewMode('detail')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              (previewMode as string) === 'detail'
                ? 'bg-purple-100 text-purple-800'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Detail
          </button>
        </div>
      </div>

      {/* Detail view - full page layout without field breakdown */}
      {previewMode === 'detail' ? (
        hasRequiredFields ? (
          isLoadingLayout ? (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-lg">Loading layout...</div>
            </div>
          ) : (
            <EventDetail event={liveEvent as EventType} header={header} footer={footer} />
          )
        ) : (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview Not Available</h2>
              <p className="text-gray-600 mb-4">
                Detail preview will appear when all required fields are configured:
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                {!liveEvent?.title && <li>• Title is required</li>}
                {!liveEvent?.dateTime && <li>• Date & Time is required</li>}
                {!liveEvent?.slug && <li>• Slug is required</li>}
              </ul>
            </div>
          </div>
        )
      ) : (
        /* Card view - component preview with field breakdown */
        <div className="min-h-screen bg-gray-50">
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              {/* Live Component Preview */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="overflow-hidden">
                  {hasRequiredFields ? (
                    <div className="overflow-hidden">
                      <Event {...(liveEvent as EventType)} {...inspectorProps} />
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <p>Preview will appear when all required fields are configured:</p>
                      <ul className="mt-2 text-sm">
                        {!liveEvent?.title && <li>• Title is required</li>}
                        {!liveEvent?.dateTime && <li>• Date & Time is required</li>}
                        {!liveEvent?.slug && <li>• Slug is required</li>}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Field Breakdown - only shown in card view */}
              <FieldBreakdown fields={eventFields} data={liveEvent} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
