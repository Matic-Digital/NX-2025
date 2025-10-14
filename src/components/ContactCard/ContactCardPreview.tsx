'use client';

import {
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';
import { ContactCard } from './ContactCard';
import type { ContactCard as ContactCardType } from './ContactCardSchema';

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
                const hasRequiredFields = liveContactCard?.sys && liveContactCard?.title && liveContactCard?.icon;
                
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
                        <h3 className="text-lg font-semibold mb-4 text-gray-600">Preview (contact card)</h3>
                        <div className="flex justify-center">
                          <ContactCard 
                            {...itemWithDefaults}
                          />
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Field Breakdown</h2>
            <div className="space-y-4">
              
              {/* Icon Field */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Icon</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Icon identifier for the contact card (e.g., &quot;Phone&quot;, &quot;Email&quot;, &quot;Location&quot;).
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {liveContactCard?.icon ? `&quot;${liveContactCard.icon}&quot;` : 'Not set'}
                </div>
              </div>

              {/* Title Field */}
              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Title</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  The main heading for this contact card.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {liveContactCard?.title ? `&quot;${liveContactCard.title}&quot;` : 'Not set'}
                </div>
              </div>

              {/* Description Field */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Description</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Descriptive text that provides additional context for the contact information.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.description ? 
                    `"${props.description.substring(0, 100)}${props.description.length > 100 ? '...' : ''}"` : 
                    'Not set'
                  }
                </div>
              </div>

              {/* Phone Field */}
              <div className="border-l-4 border-orange-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Phone</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Optional phone number for contact purposes.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.phone ? `"${props.phone}"` : 'Not set'}
                </div>
              </div>

              {/* Email Field */}
              <div className="border-l-4 border-cyan-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Email</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Optional email address for contact purposes.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.email ? `"${props.email}"` : 'Not set'}
                </div>
              </div>

              {/* CTA Field */}
              <div className="border-l-4 border-pink-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">CTA Button</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Optional call-to-action button that appears within the contact card.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.cta ? 
                    `Button configured: "${props.cta.text || 'No text'}"` : 
                    'Not set'
                  }
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
