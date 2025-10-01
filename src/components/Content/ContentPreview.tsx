'use client';

import { Content } from './Content';
import type { Content as ContentType } from './ContentSchema';

interface ContentPreviewProps extends Partial<ContentType> {
  contentId?: string;
}

/**
 * Content Preview Component
 * 
 * This component is used in Contentful Live Preview to display Content components
 * with a live preview and field breakdown.
 */
export function ContentPreview(props: ContentPreviewProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Content
              </span>
            </div>
            <div className="p-8">
              {props.sys && props.title && props.item ? (
                <Content {...(props as ContentType)} />
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>Preview will appear when all required fields are configured:</p>
                  <ul className="mt-2 text-sm">
                    {!props.title && <li>• Title is required</li>}
                    {!props.item && <li>• Item is required</li>}
                  </ul>
                </div>
              )}
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
                  The title for this content section. Used for internal organization and may be displayed depending on the variant.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.title ? `"${props.title}"` : 'Not set'}
                </div>
              </div>

              {/* Variant Field */}
              <div className="border-l-4 border-orange-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Variant</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Controls the layout and positioning. Options: ContentLeft, ContentCenter, ContentRight, FullWidth.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.variant ?? 'Default layout'}
                </div>
              </div>

              {/* Asset Field */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Asset</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  An image or video that accompanies the content. Can be positioned based on the variant setting.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.asset ? 
                    `${props.asset.__typename ?? 'Asset'} configured (${props.asset.title ?? 'Untitled'})` : 
                    'Not set'
                  }
                </div>
              </div>

              {/* Item Field */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Item</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  The main content item. Can be a Product, SectionHeading, or ContentGridItem that provides the primary content.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.item ? 
                    `${props.item.__typename ?? 'Item'} configured` : 
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
