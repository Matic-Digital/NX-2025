'use client';

import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { LivePreview } from '@/components/Preview/LivePreview';
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
          <LivePreview
            componentName="Social"
            data={liveSocial}
            requiredFields={['sys', 'title', 'link', 'icon']}
          >
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
          </LivePreview>

          {/* Field Breakdown */}
          <FieldBreakdown title="Social Fields" fields={socialFields} data={liveSocial} />
        </div>
      </div>
    </div>
  );
}
