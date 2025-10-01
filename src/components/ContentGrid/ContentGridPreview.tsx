'use client';

import { ContentGrid } from './ContentGrid';
import type { ContentGrid as ContentGridType } from './ContentGridSchema';

interface ContentGridPreviewProps extends Partial<ContentGridType> {
  contentGridId?: string;
}

/**
 * ContentGrid Preview Component
 * 
 * This component is used in Contentful Live Preview to display ContentGrid components
 * with a live preview and field breakdown.
 */
export function ContentGridPreview(props: ContentGridPreviewProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                ContentGrid
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid ContentGrid
                const hasRequiredFields = props.sys && props.title && props.itemsCollection && props.variant;
                
                if (hasRequiredFields) {
                  // Cast to full type since we've verified all required fields exist
                  const fullProps = props as ContentGridType;
                  return <ContentGrid {...fullProps} />;
                }
                
                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!props.title && <li>• Title is required</li>}
                      {!props.itemsCollection && <li>• Items Collection is required</li>}
                      {!props.variant && <li>• Variant is required</li>}
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
                  The title for this content grid. Used for internal organization and may be displayed depending on the variant.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.title ? `"${props.title}"` : 'Not set'}
                </div>
              </div>

              {/* Heading Field */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Heading</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Optional section heading that appears above the content grid. Provides context and introduction.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.heading ? 
                    `SectionHeading configured (${props.heading.title ?? 'Untitled'})` : 
                    'Not set'
                  }
                </div>
              </div>

              {/* Background Image Field */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Background Image</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Optional background image that appears behind the content grid for visual enhancement.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.backgroundImage ? 
                    `Image configured (${props.backgroundImage.title ?? 'Untitled'})` : 
                    'Not set'
                  }
                </div>
              </div>

              {/* Background Asset Field */}
              <div className="border-l-4 border-cyan-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Background Asset</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Optional background asset (video, image, etc.) that provides additional visual context.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.backgroundAsset ? 
                    `Asset configured (${props.backgroundAsset.title ?? 'Untitled'})` : 
                    'Not set'
                  }
                </div>
              </div>

              {/* Items Collection Field */}
              <div className="border-l-4 border-orange-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Items Collection</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Collection of items to display in the grid. Can include various content types like Posts, Products, Services, etc.
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

              {/* Variant Field */}
              <div className="border-l-4 border-indigo-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Variant</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Controls the layout and styling of the content grid. Determines how items are arranged and displayed.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.variant ? `"${props.variant}"` : 'Not set'}
                </div>
              </div>

              {/* Component Type Field */}
              <div className="border-l-4 border-pink-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Component Type</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Optional component type specification for additional styling or behavior customization.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.componentType ? `"${props.componentType}"` : 'Not set'}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
