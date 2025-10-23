'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { ContentGridItem as ContentGridItemComponent } from '@/components/ContentGrid/ContentGridItem';
import { contentGridItemFields } from '@/components/ContentGrid/preview/ContentGridItemFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { ContentGridItem } from '@/components/ContentGrid/ContentGridItemSchema';

/**
 * This component is used in Contentful Live Preview to display ContentGridItem components
 * with a live preview and field breakdown.
 */
export function ContentGridItemPreview(props: Partial<ContentGridItem>) {
  // Contentful Live Preview integration
  const liveContentGridItem = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveContentGridItem?.sys?.id });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Live Component Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                ContentGridItem
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid ContentGridItem
                const hasRequiredFields =
                  liveContentGridItem?.sys &&
                  liveContentGridItem?.title &&
                  liveContentGridItem?.heading;

                if (hasRequiredFields) {
                  // Cast to full type since we've verified all required fields exist
                  const fullProps = liveContentGridItem as ContentGridItem;

                  return (
                    <div className="p-8">
                      <div className="max-w-4xl mx-auto">
                        <h3 className="text-lg font-semibold mb-4 text-gray-600">
                          Preview (single content grid item)
                        </h3>
                        <ContentGridItemComponent {...fullProps} {...inspectorProps} />
                      </div>
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!liveContentGridItem?.title && <li>• Title is required</li>}
                      {!liveContentGridItem?.heading && <li>• Heading is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={contentGridItemFields} data={liveContentGridItem} />
        </div>
      </div>
    </div>
  );
}
