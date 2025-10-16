'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { richContentFields } from '@/components/RichContent/preview/RichContentFields';
import { RichContent } from '@/components/RichContent/RichContent';

import type { RichContent as RichContentType } from '@/components/RichContent/RichContentSchema';

/**
 * This component is used in Contentful Live Preview to display RichContent components
 * with a live preview and field breakdown.
 */
export function RichContentPreview(props: Partial<RichContentType>) {
  // Contentful Live Preview integration
  const liveRichContent = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveRichContent?.sys?.id });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Live Component Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                RichContent
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid RichContent
                const hasRequiredFields =
                  liveRichContent?.sys &&
                  liveRichContent?.variant &&
                  liveRichContent?.content;

                if (hasRequiredFields) {
                  return (
                    <div className="overflow-hidden" {...inspectorProps}>
                      <RichContent {...(liveRichContent as RichContentType)} />
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!liveRichContent?.variant && <li>• Variant is required</li>}
                      {!liveRichContent?.content && <li>• Content is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={richContentFields} data={liveRichContent} />
        </div>
      </div>
    </div>
  );
}
