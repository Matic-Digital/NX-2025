'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { ImageBetween } from '@/components/ImageBetween/ImageBetween';
import { imageBetweenFields } from '@/components/ImageBetween/preview/ImageBetweenFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { ImageBetween as ImageBetweenType } from '@/components/ImageBetween/ImageBetweenSchema';

/**
 * This component is used in Contentful Live Preview to display ImageBetween components
 * with a live preview and field breakdown.
 */
export function ImageBetweenPreview(props: Partial<ImageBetweenType>) {
  // Contentful Live Preview integration
  const liveImageBetween = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({
    entryId: liveImageBetween?.sys?.id
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
                ImageBetween
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid ImageBetween
                const hasRequiredFields =
                  liveImageBetween?.sys &&
                  liveImageBetween?.title &&
                  liveImageBetween?.contentTop &&
                  liveImageBetween?.contentBottom;

                if (hasRequiredFields) {
                  return (
                    <div className="overflow-hidden" {...inspectorProps}>
                      <ImageBetween {...(liveImageBetween as ImageBetweenType)} />
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!liveImageBetween?.title && <li>• Title is required</li>}
                      {!liveImageBetween?.contentTop && <li>• Content Top is required</li>}
                      {!liveImageBetween?.asset && <li>• Asset is required</li>}
                      {!liveImageBetween?.backgroundMedia && (
                        <li>• Background Media is required</li>
                      )}
                      {!liveImageBetween?.contentBottom && <li>• Content Bottom is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={imageBetweenFields} data={liveImageBetween} />
        </div>
      </div>
    </div>
  );
}
