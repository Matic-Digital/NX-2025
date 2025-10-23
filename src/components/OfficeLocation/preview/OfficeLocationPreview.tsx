'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { Location } from '@/components/OfficeLocation/OfficeLocation';
import { officeLocationFields } from '@/components/OfficeLocation/preview/OfficeLocationFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { OfficeLocation } from '@/components/OfficeLocation/OfficeLocationSchema';

/**
 * This component is used in Contentful Live Preview to display OfficeLocation components
 * with a live preview and field breakdown.
 */
export function OfficeLocationPreview(props: Partial<OfficeLocation>) {
  // Contentful Live Preview integration
  const liveOfficeLocation = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({
    entryId: liveOfficeLocation?.sys?.id
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Live Component Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                OfficeLocation
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid OfficeLocation
                const hasRequiredFields =
                  liveOfficeLocation?.sys &&
                  liveOfficeLocation?.title &&
                  liveOfficeLocation?.image &&
                  liveOfficeLocation?.country &&
                  liveOfficeLocation?.city &&
                  liveOfficeLocation?.address;

                if (hasRequiredFields && liveOfficeLocation.sys) {
                  return (
                    <div className="overflow-hidden p-6">
                      <Location sys={{ id: liveOfficeLocation.sys.id }} {...inspectorProps} />
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!liveOfficeLocation?.title && <li>• Title is required</li>}
                      {!liveOfficeLocation?.image && <li>• Image is required</li>}
                      {!liveOfficeLocation?.country && <li>• Country is required</li>}
                      {!liveOfficeLocation?.city && <li>• City is required</li>}
                      {!liveOfficeLocation?.address && <li>• Address is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={officeLocationFields} data={liveOfficeLocation} />
        </div>
      </div>
    </div>
  );
}
