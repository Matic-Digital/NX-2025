'use client';

import { ImageBetween } from './ImageBetween';
import type { ImageBetween as ImageBetweenType } from './ImageBetweenSchema';

interface ImageBetweenPreviewProps extends Partial<ImageBetweenType> {
  imageBetweenId?: string;
}

/**
 * ImageBetween Preview Component
 * 
 * This component is used in Contentful Live Preview to display ImageBetween components
 * with a live preview and field breakdown.
 */
export function ImageBetweenPreview(props: ImageBetweenPreviewProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                ImageBetween
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid ImageBetween
                const hasRequiredFields = props.sys && props.title && props.contentTop && 
                  props.asset && props.backgroundMedia && props.contentBottom;
                
                if (hasRequiredFields) {
                  // Cast to full type since we've verified all required fields exist
                  const fullProps = props as ImageBetweenType;
                  return <ImageBetween {...fullProps} />;
                }
                
                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!props.title && <li>• Title is required</li>}
                      {!props.contentTop && <li>• Content Top is required</li>}
                      {!props.asset && <li>• Asset is required</li>}
                      {!props.backgroundMedia && <li>• Background Media is required</li>}
                      {!props.contentBottom && <li>• Content Bottom is required</li>}
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
                  The title for this ImageBetween section. Used for internal organization and accessibility.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.title ? `"${props.title}"` : 'Not set'}
                </div>
              </div>

              {/* Content Top Field */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Content Top</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Content grid that appears above the central asset. Contains the upper section content.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.contentTop ? 
                    `ContentGrid configured (${props.contentTop.title ?? 'Untitled'})` : 
                    'Not set'
                  }
                </div>
              </div>

              {/* Asset Field */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Asset</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  The central asset between content sections. Can be an Image, Slider, Video, or ContentGrid.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.asset ? 
                    `${props.asset.__typename ?? 'Asset'} configured (${props.asset.title ?? 'Untitled'})` : 
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
                  Background media that appears behind the entire ImageBetween section for visual enhancement.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.backgroundMedia ? 
                    `Asset configured (${props.backgroundMedia.title ?? 'Untitled'})` : 
                    'Not set'
                  }
                </div>
              </div>

              {/* Content Bottom Field */}
              <div className="border-l-4 border-orange-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Content Bottom</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Content grid that appears below the central asset. Contains the lower section content.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.contentBottom ? 
                    `ContentGrid configured (${props.contentBottom.title ?? 'Untitled'})` : 
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
