'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { HubspotForm } from '@/components/Forms/HubspotForm/HubspotForm';
import { hubspotFormFields } from '@/components/Forms/HubspotForm/preview/HubspotFormFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { HubspotForm as HubspotFormType } from '@/components/Forms/HubspotForm/HubspotFormSchema';

/**
 * This component is used in Contentful Live Preview to display HubspotForm components
 * with a live preview and field breakdown.
 */
export function HubspotFormPreview(props: Partial<HubspotFormType>) {
  // Contentful Live Preview integration
  const liveHubspotForm = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveHubspotForm?.sys?.id });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Live Component Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                HubspotForm
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid HubspotForm
                const hasRequiredFields = liveHubspotForm?.sys && liveHubspotForm?.formId;

                if (hasRequiredFields) {
                  return (
                    <div className="overflow-hidden p-6">
                      <HubspotForm
                        hubspotForm={liveHubspotForm as HubspotFormType}
                        theme="light"
                        {...inspectorProps}
                      />
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!liveHubspotForm?.formId && <li>• Form ID is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={hubspotFormFields} data={liveHubspotForm} />
        </div>
      </div>
    </div>
  );
}
