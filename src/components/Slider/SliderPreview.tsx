'use client';

import { Slider } from './Slider';
import type { Slider as SliderType } from './SliderSchema';

interface SliderPreviewProps extends Partial<SliderType> {
  sliderId?: string;
}

/**
 * Slider Preview Component
 * 
 * This component is used in Contentful Live Preview to display Slider components
 * with a live preview and field breakdown.
 */
export function SliderPreview(props: SliderPreviewProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Slider
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid Slider
                const hasRequiredFields = props.sys && props.title && props.itemsCollection;
                
                if (hasRequiredFields) {
                  // Cast to full type since we've verified all required fields exist
                  const fullProps = props as SliderType;
                  return <Slider {...fullProps} />;
                }
                
                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!props.title && <li>• Title is required</li>}
                      {!props.itemsCollection && <li>• Items Collection is required</li>}
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
                  The title for this slider. Used for internal organization and may be displayed depending on implementation.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.title ? `"${props.title}"` : 'Not set'}
                </div>
              </div>

              {/* Items Collection Field */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Items Collection</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Collection of items to display in the slider. Can include SliderItems, Posts, Images, TimelineItems, TeamMembers, or Solutions.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.itemsCollection?.items ? 
                    `${props.itemsCollection.items.length} item(s) configured` : 
                    'Not set'
                  }
                </div>
                {props.itemsCollection?.items && props.itemsCollection.items.length > 0 && (
                  <div className="mt-2 text-xs text-gray-400">
                    Item types: {props.itemsCollection.items.map(item => item.__typename ?? 'Unknown').join(', ')}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
