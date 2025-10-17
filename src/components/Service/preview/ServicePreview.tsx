'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { ServiceCardProvider } from '@/contexts/ServiceCardContext';

import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { serviceFields } from '@/components/Service/preview/ServiceFields';
import { ServiceCard } from '@/components/Service/ServiceCard';

import type { Service as ServiceType } from '@/components/Service/ServiceSchema';

/**
 * This component is used in Contentful Live Preview to display Service components
 * with a live preview and field breakdown.
 */
export function ServicePreview(props: Partial<ServiceType>) {
  // Contentful Live Preview integration
  const liveService = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveService?.sys?.id });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Live Component Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Service
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid Service
                const hasRequiredFields =
                  liveService?.sys &&
                  liveService?.title &&
                  liveService?.slug &&
                  liveService?.cardButtonText;

                if (hasRequiredFields) {
                  return (
                    <div className="p-8 max-w-md mx-auto" {...inspectorProps}>
                      <ServiceCardProvider>
                        <ServiceCard {...(liveService as ServiceType)} />
                      </ServiceCardProvider>
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!liveService?.title && <li>• Title is required</li>}
                      {!liveService?.slug && <li>• Slug is required</li>}
                      {!liveService?.cardButtonText && <li>• Card Button Text is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={serviceFields} data={liveService} />
        </div>
      </div>
    </div>
  );
}
