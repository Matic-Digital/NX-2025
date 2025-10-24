'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { LivePreview } from '@/components/Preview/LivePreview';
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
          <LivePreview
            componentName="RichContent"
            data={liveRichContent}
            requiredFields={['sys', 'variant', 'content']}
          >
            <div className="overflow-hidden" {...inspectorProps}>
              <RichContent {...(liveRichContent as RichContentType)} />
            </div>
          </LivePreview>

          {/* Field Breakdown */}
          <FieldBreakdown fields={richContentFields} data={liveRichContent} />
        </div>
      </div>
    </div>
  );
}
