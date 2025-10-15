'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { AirImage } from '@/components/Image/AirImage';
import { imageFields } from '@/components/Image/preview/ImageFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { AirImage as AirImageType } from '@/components/Image/ImageSchema';

/**
 * This component is used in Contentful Live Preview to display Image components
 * with a live preview and field breakdown.
 */
export function ImagePreview(props: Partial<AirImageType>) {
  // Contentful Live Preview integration
  const liveImage = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveImage?.sys?.id });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Live Component Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Image
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have a valid image link
                const hasRequiredFields = liveImage?.link;

                if (hasRequiredFields) {
                  return (
                    <div className="overflow-hidden p-6 flex items-center justify-center bg-gray-50">
                      <AirImage {...(liveImage as AirImageType)} {...inspectorProps} />
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!liveImage?.link && <li>• Image URL (link) is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={imageFields} data={liveImage} />
        </div>
      </div>
    </div>
  );
}
