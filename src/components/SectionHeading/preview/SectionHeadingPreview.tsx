'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { LivePreview } from '@/components/Preview/LivePreview';
import { sectionHeadingFields } from '@/components/SectionHeading/preview/SectionHeadingFields';
import { SectionHeading } from '@/components/SectionHeading/SectionHeading';

import type { SectionHeading as SectionHeadingType } from '@/components/SectionHeading/SectionHeadingSchema';

/**
 * This component is used in Contentful Live Preview to display SectionHeading components
 * with a live preview and field breakdown.
 */
export function SectionHeadingPreview(props: Partial<SectionHeadingType>) {
  // Contentful Live Preview integration
  const liveSectionHeading = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveSectionHeading?.sys?.id });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Live Component Preview */}
          <LivePreview
            componentName="SectionHeading"
            data={liveSectionHeading}
            requiredFields={['sys', 'title']}
          >
            <div className="overflow-hidden p-8" {...inspectorProps}>
              <SectionHeading {...(liveSectionHeading as SectionHeadingType)} />
            </div>
          </LivePreview>

          {/* Field Breakdown */}
          <FieldBreakdown fields={sectionHeadingFields} data={liveSectionHeading} />
        </div>
      </div>
    </div>
  );
}
