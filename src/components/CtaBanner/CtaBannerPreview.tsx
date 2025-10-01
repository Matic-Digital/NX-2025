'use client';

import { CtaBanner } from './CtaBanner';
import type { CtaBanner as CtaBannerType } from './CtaBannerSchema';

interface CtaBannerPreviewProps extends Partial<CtaBannerType> {
  ctaBannerId?: string;
}

/**
 * CtaBanner Preview Component
 * 
 * This component is used in Contentful Live Preview to display CtaBanner components
 * with a live preview and field breakdown.
 */
export function CtaBannerPreview(props: CtaBannerPreviewProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                CtaBanner
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid CtaBanner
                const hasRequiredFields = props.sys && props.title && props.description && 
                  props.backgroundImage && props.backgroundMedia && props.primaryCta && props.secondaryCta;
                
                if (hasRequiredFields) {
                  // Cast to full type since we've verified all required fields exist
                  const fullProps = props as CtaBannerType;
                  return <CtaBanner {...fullProps} />;
                }
                
                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!props.title && <li>• Title is required</li>}
                      {!props.description && <li>• Description is required</li>}
                      {!props.backgroundImage && <li>• Background Image is required</li>}
                      {!props.backgroundMedia && <li>• Background Media is required</li>}
                      {!props.primaryCta && <li>• Primary CTA is required</li>}
                      {!props.secondaryCta && <li>• Secondary CTA is required</li>}
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
              
              {/* Title Field */}
              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Title</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  The main headline for the CTA banner. This is the primary message that encourages user action.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.title ? `"${props.title}"` : 'Not set'}
                </div>
              </div>

              {/* Description Field */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Description</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Supporting text that provides additional context and motivation for the call-to-action.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.description ? `"${props.description}"` : 'Not set'}
                </div>
              </div>

              {/* Background Image Field */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Background Image</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  The background asset that appears behind the banner content. Creates visual impact and context.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.backgroundImage ? 
                    `Asset configured (${props.backgroundImage.title ?? 'Untitled'})` : 
                    'Not set'
                  }
                </div>
              </div>

              {/* Background Media Field */}
              <div className="border-l-4 border-cyan-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Background Media</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Additional background media element. Works in conjunction with the background image for enhanced visual appeal.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.backgroundMedia ? 
                    `Image configured (${props.backgroundMedia.title || 'Untitled'})` : 
                    'Not set'
                  }
                </div>
              </div>

              {/* Primary CTA Field */}
              <div className="border-l-4 border-orange-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Primary CTA</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  The main call-to-action button. This should be the primary action you want users to take.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.primaryCta ? 
                    `Button configured (${props.primaryCta.text ?? props.primaryCta.internalText ?? 'No text'})` : 
                    'Not set'
                  }
                </div>
              </div>

              {/* Secondary CTA Field */}
              <div className="border-l-4 border-indigo-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Secondary CTA</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  A secondary call-to-action button. Provides an alternative action or supports the primary CTA.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.secondaryCta ? 
                    `Button configured (${props.secondaryCta.text ?? props.secondaryCta.internalText ?? 'No text'})` : 
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
