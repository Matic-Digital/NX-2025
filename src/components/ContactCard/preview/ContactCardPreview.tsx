'use client';

import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { ContactCard } from '@/components/ContactCard/ContactCard';
import { contactCardFields } from '@/components/ContactCard/preview/ContactCardFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { LivePreview } from '@/components/Preview/LivePreview';

import type { ContactCard as ContactCardType } from '@/components/ContactCard/ContactCardSchema';

/**
 * ContactCard Preview Component
 *
 * This component is used in Contentful Live Preview to display ContactCard components
 * with a live preview and field breakdown.
 */
export function ContactCardPreview(props: Partial<ContactCardType>) {
  // Contentful Live Preview integration
  const liveContactCard = useContentfulLiveUpdates(props);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <LivePreview
            componentName="ContactCard"
            data={liveContactCard}
            requiredFields={['sys', 'title', 'icon']}
          >
            <div className="p-4">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-lg font-semibold mb-4 text-gray-600">Preview (contact card)</h3>
                <div className="flex">
                  <ContactCard {...(liveContactCard as ContactCardType)} />
                </div>
              </div>
            </div>
          </LivePreview>

          {/* Field Breakdown */}
          <FieldBreakdown
            title="ContactCard Fields"
            fields={contactCardFields}
            data={liveContactCard}
          />
        </div>
      </div>
    </div>
  );
}
