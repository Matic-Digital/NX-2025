'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { CtaBanner } from '@/components/CtaBanner/CtaBanner';
import { ctaBannerFields } from '@/components/CtaBanner/preview/CtaBannerFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { CtaBanner as CtaBannerType } from '@/components/CtaBanner/CtaBannerSchema';

interface CtaBannerPreviewProps extends Partial<CtaBannerType> {
  ctaBannerId?: string;
}

/**
 * This component is used in Contentful Live Preview to display CtaBanner components
 * with a live preview and field breakdown.
 */
export function CtaBannerPreview(props: CtaBannerPreviewProps) {
  // Contentful Live Preview integration
  const liveCtaBanner = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveCtaBanner?.sys?.id });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Live Component Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                CtaBanner
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid CtaBanner
                const hasRequiredFields =
                  liveCtaBanner?.sys &&
                  liveCtaBanner?.title &&
                  liveCtaBanner?.description &&
                  liveCtaBanner?.primaryCta &&
                  liveCtaBanner?.backgroundImage;

                if (hasRequiredFields) {
                  return (
                    <div className="overflow-hidden">
                      <CtaBanner {...(liveCtaBanner as CtaBannerType)} {...inspectorProps} />
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!liveCtaBanner?.title && <li>• Title is required</li>}
                      {!liveCtaBanner?.description && <li>• Description is required</li>}
                      {!liveCtaBanner?.primaryCta && <li>• Primary CTA is required</li>}
                      {!liveCtaBanner?.backgroundImage && <li>• Background Image is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={ctaBannerFields} data={liveCtaBanner} />
        </div>
      </div>
    </div>
  );
}
