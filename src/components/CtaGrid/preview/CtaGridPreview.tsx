'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { CtaGrid } from '@/components/CtaGrid/CtaGrid';
import { ctaGridFields } from '@/components/CtaGrid/preview/CtaGridFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { CtaGrid as CtaGridType } from '@/components/CtaGrid/CtaGridSchema';

/**
 * This component is used in Contentful Live Preview to display CtaGrid components
 * with a live preview and field breakdown.
 */
export function CtaGridPreview(props: Partial<CtaGridType>) {
  // Contentful Live Preview integration
  const liveData = useContentfulLiveUpdates(props) as CtaGridType | { item: CtaGridType };
  // Access the nested item property if it exists, otherwise use the data directly
  const liveCtaGrid = 'item' in liveData ? liveData.item : liveData;
  const inspectorProps = useContentfulInspectorMode({ entryId: liveCtaGrid?.sys?.id });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Live Component Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                CtaGrid
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid CtaGrid
                const hasRequiredFields =
                  liveCtaGrid?.sys &&
                  liveCtaGrid?.title &&
                  liveCtaGrid?.itemsCollection &&
                  liveCtaGrid?.variant;

                if (hasRequiredFields) {
                  return (
                    <div className="overflow-hidden">
                      <CtaGrid {...liveCtaGrid} {...inspectorProps} />
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!liveCtaGrid?.title && <li>• Title is required</li>}
                      {!liveCtaGrid?.itemsCollection && <li>• Items Collection is required</li>}
                      {!liveCtaGrid?.variant && <li>• Variant is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={ctaGridFields} data={liveCtaGrid} />
        </div>
      </div>
    </div>
  );
}
