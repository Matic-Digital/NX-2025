'use client';

import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { ContactCard } from '@/components/ContactCard/ContactCard';
import { contactCardFields } from '@/components/ContactCard/preview/ContactCardFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { ContactCard as ContactCardType } from '@/components/ContactCard/ContactCardSchema';

interface ContactCardPreviewProps extends Partial<ContactCardType> {
  contactCardId?: string;
}

/**
 * ContactCard Preview Component
 *
 * This component is used in Contentful Live Preview to display ContactCard components
 * with a live preview and field breakdown.
 */
export function ContactCardPreview(props: ContactCardPreviewProps) {
  // Contentful Live Preview integration
  const liveContactCard = useContentfulLiveUpdates(props);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                ContactCard
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields
                const hasRequiredFields =
                  liveContactCard?.sys && liveContactCard?.title && liveContactCard?.icon;

                if (hasRequiredFields) {
                  // Cast to full type since we've verified all required fields exist
                  const fullProps = liveContactCard as ContactCardType;

                  // Ensure the item has all required fields for the ContactCard component
                  const itemWithDefaults = {
                    ...fullProps,
                    phone: fullProps.phone ?? '',
                    email: fullProps.email ?? '',
                    cta: fullProps.cta ?? undefined
                  } as ContactCardType;

                  return (
                    <div className="p-4">
                      <div className="max-w-4xl mx-auto">
                        <h3 className="text-lg font-semibold mb-4 text-gray-600">
                          Preview (contact card)
                        </h3>
                        <div className="flex">
                          <ContactCard {...itemWithDefaults} />
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
                      {!liveContactCard?.title && <li>• Title is required</li>}
                      {!liveContactCard?.icon && <li>• Icon is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

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
