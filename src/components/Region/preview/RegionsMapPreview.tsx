'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { regionsMapFields } from '@/components/Region/preview/RegionsMapFields';
import { RegionsMap } from '@/components/Region/RegionsMap';

import type { RegionsMap as RegionsMapType } from '@/components/Region/RegionSchema';

/**
 * This component is used in Contentful Live Preview to display RegionsMap components
 * with a live preview and field breakdown.
 */
export function RegionsMapPreview(props: Partial<RegionsMapType>) {
  // Contentful Live Preview integration
  const liveRegionsMap = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveRegionsMap?.sys?.id });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Live Component Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                RegionsMap
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid RegionsMap
                const hasRequiredFields =
                  liveRegionsMap?.sys &&
                  liveRegionsMap?.title &&
                  liveRegionsMap?.overline &&
                  liveRegionsMap?.regionsCollection;

                if (hasRequiredFields) {
                  return (
                    <div className="overflow-hidden p-8" {...inspectorProps}>
                      <RegionsMap {...(liveRegionsMap as RegionsMapType)} />
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!liveRegionsMap?.title && <li>• Title is required</li>}
                      {!liveRegionsMap?.overline && <li>• Overline is required</li>}
                      {!liveRegionsMap?.regionsCollection && (
                        <li>• Regions Collection is required</li>
                      )}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={regionsMapFields} data={liveRegionsMap} />
        </div>
      </div>
    </div>
  );
}
