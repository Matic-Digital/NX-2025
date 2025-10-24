'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { CtaBanner } from '@/components/CtaBanner/CtaBanner';
import { ctaBannerFields } from '@/components/CtaBanner/preview/CtaBannerFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { LivePreview } from '@/components/Preview/LivePreview';

import type { CtaBanner as CtaBannerType } from '@/components/CtaBanner/CtaBannerSchema';

/**
 * This component is used in Contentful Live Preview to display CtaBanner components
 * with a live preview and field breakdown.
 */
export function CtaBannerPreview(props: Partial<CtaBannerType>) {
  // Contentful Live Preview integration
  const liveCtaBanner = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveCtaBanner?.sys?.id });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Live Component Preview */}
          <LivePreview
            componentName="CtaBanner"
            data={liveCtaBanner}
            requiredFields={['sys', 'title', 'description', 'primaryCta', 'backgroundImage']}
          >
            <div className="overflow-hidden">
              <CtaBanner {...(liveCtaBanner as CtaBannerType)} {...inspectorProps} />
            </div>
          </LivePreview>

          {/* Field Breakdown */}
          <FieldBreakdown fields={ctaBannerFields} data={liveCtaBanner} />
        </div>
      </div>
    </div>
  );
}
