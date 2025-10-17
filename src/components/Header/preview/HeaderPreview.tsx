'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { Header } from '@/components/Header/Header';
import { headerFields } from '@/components/Header/preview/HeaderFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { Header as HeaderType } from '@/components/Header/HeaderSchema';

/**
 * This component is used in Contentful Live Preview to display Header components
 * with a live preview and field breakdown.
 */
export function HeaderPreview(props: Partial<HeaderType>) {
  // Contentful Live Preview integration
  const liveHeader = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveHeader?.sys?.id });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Live Component Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Header
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid Header
                const hasRequiredFields = liveHeader?.sys && liveHeader?.name && liveHeader?.logo;

                if (hasRequiredFields) {
                  return (
                    <div className="overflow-hidden">
                      <Header {...(liveHeader as HeaderType)} {...inspectorProps} />
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!liveHeader?.name && <li>• Name is required</li>}
                      {!liveHeader?.logo && <li>• Logo is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={headerFields} data={liveHeader} />
        </div>
      </div>
    </div>
  );
}
