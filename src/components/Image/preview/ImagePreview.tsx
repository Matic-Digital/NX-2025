'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { AirImage } from '@/components/Image/AirImage';
import { imageFields } from '@/components/Image/preview/ImageFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { LivePreview } from '@/components/Preview/LivePreview';

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
          <LivePreview
            componentName="Image"
            data={liveImage}
            requiredFields={['link']}
          >
            <div className="overflow-hidden p-6 flex items-center justify-center bg-gray-50">
              <AirImage {...(liveImage as AirImageType)} {...inspectorProps} />
            </div>
          </LivePreview>

          {/* Field Breakdown */}
          <FieldBreakdown fields={imageFields} data={liveImage} />
        </div>
      </div>
    </div>
  );
}
