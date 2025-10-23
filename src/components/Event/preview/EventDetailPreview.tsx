'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { EventDetail } from '@/components/Event/EventDetail';
import { eventFields } from '@/components/Event/preview/EventFields';
import { getFooterById } from '@/components/Footer/FooterApi';
import { getHeaderById } from '@/components/Header/HeaderApi';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { Event as EventType } from '@/components/Event/EventSchema';
import type { Footer } from '@/components/Footer/FooterSchema';
import type { Header } from '@/components/Header/HeaderSchema';

/**
 * This component is used in Contentful Live Preview to display Event Detail components
 * with a live preview and field breakdown for different templates.
 */
export function EventDetailPreview(props: Partial<EventType>) {
  // Contentful Live Preview integration
  const liveEvent = useContentfulLiveUpdates(props);
  const _inspectorProps = useContentfulInspectorMode({ entryId: liveEvent?.sys?.id });

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
    liveEvent?.sys &&
    liveEvent?.title &&
    liveEvent?.dateTime &&
    liveEvent?.slug &&
    liveEvent?.template;

  if (hasRequiredFields) {
    // Render the full EventDetail component without any wrapper constraints
    return (
      <div className="min-h-screen">
        <div>
          {isLoadingLayout ? (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-lg">Loading layout...</div>
            </div>
          ) : (
            <EventDetail event={liveEvent as EventType} header={header} footer={footer} />
          )}
        </div>
      </div>
    );
  }

  // Show preview placeholder when fields are missing
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Template Selector */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Template: {liveEvent?.template ?? 'Not Set'}
              </span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Event Detail
              </span>
            </div>
          </div>

          {/* Error State */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium mb-4">
                Preview will appear when all required fields are configured:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="text-left">
                  <h4 className="font-medium text-gray-700 mb-2">Required Fields:</h4>
                  <ul className="text-sm space-y-1">
                    {!liveEvent?.title && <li className="text-red-600">• Title is required</li>}
                    {!liveEvent?.dateTime && (
                      <li className="text-red-600">• Date & Time is required</li>
                    )}
                    {!liveEvent?.slug && <li className="text-red-600">• Slug is required</li>}
                    {!liveEvent?.template && (
                      <li className="text-red-600">• Template is required</li>
                    )}
                  </ul>
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-700 mb-2">Available Templates:</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Landing 1</li>
                    <li>• Landing 2</li>
                    <li>• Landing 3</li>
                    <li>• Agenda</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Template Information */}
          {liveEvent?.template && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Template: {liveEvent.template}
              </h3>
              <div className="text-sm text-gray-600">
                {liveEvent.template === 'Landing 1' && (
                  <p>
                    Full-featured layout with banner, content sections, news posts, slider, and form
                    CTA.
                  </p>
                )}
                {liveEvent.template === 'Landing 2' && (
                  <p>Alternative layout with different styling and content arrangement.</p>
                )}
                {liveEvent.template === 'Landing 3' && (
                  <p>Simplified layout focusing on contact information and referenced posts.</p>
                )}
                {liveEvent.template === 'Agenda' && (
                  <p>Specialized layout for displaying event agenda and schedule information.</p>
                )}
              </div>
            </div>
          )}

          {/* Field Breakdown */}
          <FieldBreakdown fields={eventFields} data={liveEvent} />
        </div>
      </div>
    </div>
  );
}
