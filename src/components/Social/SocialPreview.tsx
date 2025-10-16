'use client';

import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { socialFields } from '@/components/Social/preview/SocialFields';
import { Social } from '@/components/Social/Social';

import type { Social as SocialType } from '@/components/Social/SocialSchema';

/**
 * Social Preview Component
 *
 * This component is used in Contentful Live Preview to display Social components
 * with a live preview and field breakdown.
 */
export function SocialPreview(props: Partial<SocialType>) {
  // Contentful Live Preview integration
  const liveSocial = useContentfulLiveUpdates(props);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Social
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid Social
                const hasRequiredFields =
                  liveSocial?.sys && liveSocial?.title && liveSocial?.link && liveSocial?.icon;

                if (hasRequiredFields) {
                  return (
                    <div className="p-8">
                      <div className="max-w-md mx-auto">
                        <h3 className="text-lg font-semibold mb-4 text-gray-600">
                          Preview (social link)
                        </h3>
                        <div className="flex">
                          <Social social={liveSocial as SocialType} />
                        </div>
                      </div>
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!liveSocial?.title && <li>• Title is required</li>}
                      {!liveSocial?.link && <li>• Link is required</li>}
                      {!liveSocial?.icon && <li>• Icon is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown title="Social Fields" fields={socialFields} data={liveSocial} />
        </div>
      </div>
    </div>
  );
}
