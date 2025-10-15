'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { Footer } from '@/components/Footer/Footer';
import { footerFields } from '@/components/Footer/preview/FooterFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { Footer as FooterType } from '@/components/Footer/FooterSchema';

/**
 * This component is used in Contentful Live Preview to display Footer components
 * with a live preview and field breakdown.
 */
export function FooterPreview(props: Partial<FooterType>) {
  // Contentful Live Preview integration
  const liveFooter = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveFooter?.sys?.id });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Live Component Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Footer
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid Footer
                const hasRequiredFields = liveFooter?.sys && liveFooter?.title;

                if (hasRequiredFields) {
                  return (
                    <div className="overflow-hidden">
                      <Footer {...(liveFooter as FooterType)} {...inspectorProps} />
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!liveFooter?.title && <li>• Title is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={footerFields} data={liveFooter} />
        </div>
      </div>
    </div>
  );
}
