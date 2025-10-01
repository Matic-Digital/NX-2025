'use client';

// No main Social component exists, using simple preview
import type { Social as SocialType } from './SocialSchema';

interface SocialPreviewProps extends Partial<SocialType> {
  socialId?: string;
}

/**
 * Social Preview Component
 * 
 * This component is used in Contentful Live Preview to display Social components
 * with a live preview and field breakdown.
 */
export function SocialPreview(props: SocialPreviewProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Social
              </span>
            </div>
            <div className="p-8 flex justify-center">
              {(() => {
                // Check if we have required fields for a valid Social
                const hasRequiredFields = props.sys && props.title && props.link && props.icon;
                
                if (hasRequiredFields) {
                  // Show a simple preview since no main Social component exists
                  return (
                    <div className="flex items-center space-x-3 border rounded-lg p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={props.icon!.url} 
                        alt={props.icon!.title ?? props.title}
                        className="w-8 h-8"
                      />
                      <div>
                        <h3 className="font-medium">{props.title}</h3>
                        <a 
                          href={props.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {props.link}
                        </a>
                      </div>
                    </div>
                  );
                }
                
                // Show preview placeholder when fields are missing
                return (
                  <div className="text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!props.title && <li>• Title is required</li>}
                      {!props.link && <li>• Link is required</li>}
                      {!props.icon && <li>• Icon is required</li>}
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
                  The name of the social media platform or service. Used for accessibility and identification.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.title ? `"${props.title}"` : 'Not set'}
                </div>
              </div>

              {/* Link Field */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Link</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  The URL that users will be taken to when they click the social media icon. Should be a valid external link.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.link ? `"${props.link}"` : 'Not set'}
                </div>
              </div>

              {/* Icon Field */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Icon</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  The icon image that represents the social media platform. Should be recognizable and appropriately sized.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.icon ? (
                    <div>
                      <div>Icon configured: {props.icon.title ?? 'Untitled'}</div>
                      <div className="mt-1">URL: {props.icon.url}</div>
                      {props.icon.width && props.icon.height && (
                        <div>Dimensions: {props.icon.width}x{props.icon.height}px</div>
                      )}
                    </div>
                  ) : 'Not set'}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
