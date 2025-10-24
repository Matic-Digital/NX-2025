'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { Location } from '@/components/OfficeLocation/OfficeLocation';
import { officeLocationFields } from '@/components/OfficeLocation/preview/OfficeLocationFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { LivePreview } from '@/components/Preview/LivePreview';

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
          <LivePreview
            componentName="OfficeLocation"
            data={liveOfficeLocation}
            requiredFields={['sys', 'title', 'image', 'country', 'city', 'address']}
          >
            <div className="overflow-hidden p-6">
              <Location sys={{ id: liveOfficeLocation.sys!.id }} {...inspectorProps} />
            </div>
          </LivePreview>

          {/* Field Breakdown */}
          <FieldBreakdown fields={officeLocationFields} data={liveOfficeLocation} />
        </div>
      </div>
    </div>
  );
}
