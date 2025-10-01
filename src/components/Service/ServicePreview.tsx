'use client';

// ServiceCard import removed as it's not used in this preview
import type { Service as ServiceType } from './ServiceSchema';

interface ServicePreviewProps extends Partial<ServiceType> {
  serviceId?: string;
}

/**
 * Service Preview Component
 * 
 * This component is used in Contentful Live Preview to display Service components
 * with a live preview and field breakdown.
 */
export function ServicePreview(props: ServicePreviewProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Service
              </span>
            </div>
            <div className="p-8">
              {(() => {
                // Check if we have required fields for a valid Service
                const hasRequiredFields = props.sys && props.title && props.slug;
                
                if (hasRequiredFields) {
                  // Show a simple preview since ServiceCard has different props
                  return (
                    <div className="border rounded-lg p-6 max-w-sm">
                      <h3 className="text-lg font-semibold mb-2">{props.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">Slug: {props.slug}</p>
                      {props.cardTitle && <p className="text-sm mb-2">Card Title: {props.cardTitle}</p>}
                      {props.cardTags && props.cardTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {props.cardTags.map((tag, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {props.cardButtonText && (
                        <button className="bg-blue-500 text-white px-4 py-2 rounded text-sm">
                          {props.cardButtonText}
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
                  The main title of the service. This appears as the primary heading and is used for navigation.
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
                  URL-friendly identifier for the service. Used in the page URL and for linking to this service.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.slug ? `"${props.slug}"` : 'Not set'}
                  {props.slug && <div className="mt-1">URL: /services/{props.slug}</div>}
                </div>
              </div>

              {/* Card Image Field */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Card Image</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Image that appears on service cards in grid layouts. Should be visually representative of the service.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.cardImage ? 
                    `Image configured (${props.cardImage.title || 'Untitled'})` : 
                    'Not set'
                  }
                </div>
              </div>

              {/* Card Title Field */}
              <div className="border-l-4 border-orange-500 pl-4">
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

              {/* Card Tags Field */}
              <div className="border-l-4 border-indigo-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Card Tags</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Tags or categories that appear on service cards. Used for categorization and filtering.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.cardTags && props.cardTags.length > 0 ? 
                    `${props.cardTags.length} tag(s): ${props.cardTags.join(', ')}` : 
                    'Not set'
                  }
                </div>
              </div>

              {/* Card Button Text Field */}
              <div className="border-l-4 border-pink-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Card Button Text</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Text for the call-to-action button on service cards. Typically something like &quot;Learn More&quot; or &quot;View Details&quot;.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.cardButtonText ? `"${props.cardButtonText}"` : 'Not set'}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
