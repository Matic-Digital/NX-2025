'use client';

import { ContentGrid } from '@/components/ContentGrid/ContentGrid';
import { contentGridFields } from '@/components/ContentGrid/preview/ContentGridFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { ContentGrid as ContentGridType } from '@/components/ContentGrid/ContentGridSchema';

interface ContentGridPreviewProps extends Partial<ContentGridType> {
  contentGridId?: string;
}

/**
 * ContentGrid Preview Component
 *
 * This component is used in Contentful Live Preview to display ContentGrid components
 * with a live preview and field breakdown.
 */
export function ContentGridPreview(props: ContentGridPreviewProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                ContentGrid
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid ContentGrid
                const hasRequiredFields =
                  props.sys && props.title && props.itemsCollection && props.variant;

                if (hasRequiredFields) {
                  // Cast to full type since we've verified all required fields exist
                  const fullProps = props as ContentGridType;
                  return <ContentGrid {...fullProps} />;
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!props.title && <li>• Title is required</li>}
                      {!props.itemsCollection && <li>• Items Collection is required</li>}
                      {!props.variant && <li>• Variant is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={contentGridFields} data={props} />
        </div>
      </div>
    </div>
  );
}
