'use client';

// SolutionCard import removed as it's not used in this preview
import type { Solution as SolutionType } from './SolutionSchema';

interface SolutionPreviewProps extends Partial<SolutionType> {
  solutionId?: string;
}

/**
 * Solution Preview Component
 * 
 * This component is used in Contentful Live Preview to display Solution components
 * with a live preview and field breakdown.
 */
export function SolutionPreview(props: SolutionPreviewProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Solution
              </span>
            </div>
            <div className="p-8">
              {(() => {
                // Check if we have required fields for a valid Solution
                const hasRequiredFields = props.sys && props.title && props.slug && props.description;
                
                if (hasRequiredFields) {
                  // Show a simple preview since SolutionCard may have different props
                  return (
                    <div className="border rounded-lg p-6 max-w-md">
                      <h3 className="text-lg font-semibold mb-2">{props.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">Slug: {props.slug}</p>
                      {props.heading && <h4 className="text-md font-medium mb-2">{props.heading}</h4>}
                      {props.subheading && <p className="text-sm text-gray-500 mb-2">{props.subheading}</p>}
                      <p className="text-sm mb-4">{props.description}</p>
                      {props.cta && (
                        <button className="bg-blue-500 text-white px-4 py-2 rounded text-sm">
                          {props.cta.text || props.cta.internalText}
                        </button>
                      )}
                    </div>
                  );
                }
                
                // Show preview placeholder when fields are missing
                return (
                  <div className="text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!props.title && <li>• Title is required</li>}
                      {!props.slug && <li>• Slug is required</li>}
                      {!props.description && <li>• Description is required</li>}
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
                  The main title of the solution. This appears as the primary heading and is used for navigation.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.title ? `"${props.title}"` : 'Not set'}
                </div>
              </div>

              {/* Slug Field */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Slug</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  URL-friendly identifier for the solution. Used in the page URL and for linking to this solution.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.slug ? `"${props.slug}"` : 'Not set'}
                  {props.slug && <div className="mt-1">URL: /solutions/{props.slug}</div>}
                </div>
              </div>

              {/* Description Field */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Description</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Detailed description of the solution. Explains what the solution does and its benefits.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.description ? `"${props.description.substring(0, 100)}${props.description.length > 100 ? '...' : ''}"` : 'Not set'}
                </div>
              </div>

              {/* Heading Field */}
              <div className="border-l-4 border-orange-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Heading</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Alternative heading for the solution page. If not set, the main title will be used.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.heading ? `"${props.heading}"` : 'Not set (will use main title)'}
                </div>
              </div>

              {/* Subheading Field */}
              <div className="border-l-4 border-cyan-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Subheading</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Supporting text that appears below the main heading. Provides additional context or tagline.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.subheading ? `"${props.subheading}"` : 'Not set'}
                </div>
              </div>

              {/* Card Title Field */}
              <div className="border-l-4 border-indigo-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Card Title</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Alternative title for use in card layouts. If not set, the main title will be used.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.cardTitle ? `"${props.cardTitle}"` : 'Not set (will use main title)'}
                </div>
              </div>

              {/* Background Image Field */}
              <div className="border-l-4 border-pink-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Background Image</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Background image for the solution page or card. Should be visually representative of the solution.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.backgroundImage ? 
                    `Image configured (${props.backgroundImage.title || 'Untitled'})` : 
                    'Not set'
                  }
                </div>
              </div>

              {/* CTA Field */}
              <div className="border-l-4 border-emerald-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">CTA</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Call-to-action button for the solution. Encourages users to take the next step.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.cta ? 
                    `Button configured (${props.cta.text || props.cta.internalText || 'No text'})` : 
                    'Not set'
                  }
                </div>
              </div>

              {/* Variant Field */}
              <div className="border-l-4 border-amber-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Variant</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Visual variant that controls the layout and styling of the solution display.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.variant ? `"${props.variant}"` : 'Not set (default styling)'}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
