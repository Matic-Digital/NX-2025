'use client';

import {
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';
import { Collection } from './Collection';
import type { Collection as CollectionType } from './CollectionSchema';

interface CollectionPreviewProps extends Partial<CollectionType> {
  collectionId?: string;
}

/**
 * Collection Preview Component
 * 
 * This component is used in Contentful Live Preview to display Collection components
 * with a live preview and field breakdown.
 */
export function CollectionPreview(props: CollectionPreviewProps) {
  // Contentful Live Preview integration
  const liveCollection = useContentfulLiveUpdates(props);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Collection
              </span>
            </div>
            <div className="overflow-hidden">
              {liveCollection?.sys && liveCollection?.title ? (
                <Collection 
                  collectionData={liveCollection as CollectionType}
                  sys={liveCollection.sys}
                />
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>Preview will appear when all required fields are configured:</p>
                  <ul className="mt-2 text-sm">
                    {!liveCollection?.title && <li>• Title is required</li>}
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
                  The main title for the collection. This appears as the heading above the content.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {liveCollection?.title ? `"${liveCollection.title}"` : 'Not set'}
                </div>
              </div>

              {/* Content Type Field */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Content Type</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Types of content to display in this collection. Options: Post, Page, Product, Solution, Service.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {liveCollection?.contentType?.length ? 
                    liveCollection.contentType.join(', ') : 
                    'All content types'
                  }
                </div>
              </div>

              {/* Items Per Page Field */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Items Per Page</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Number of items to display per page. Controls pagination behavior.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {liveCollection?.itemsPerPage ?? 'Default (12)'}
                </div>
              </div>

              {/* Search Bar Field */}
              <div className="border-l-4 border-orange-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Search Bar</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Whether to show a search bar above the collection for filtering content.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {liveCollection?.searchBar ? 'Enabled' : 'Disabled'}
                </div>
              </div>

              {/* Pagination Field */}
              <div className="border-l-4 border-indigo-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Pagination</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Pagination style for the collection. Controls how users navigate through multiple pages.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {liveCollection?.pagination?.length ? 
                    liveCollection.pagination.join(', ') : 
                    'Default'
                  }
                </div>
              </div>

              {/* Tags Field */}
              <div className="border-l-4 border-pink-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Tags</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Content tags used for filtering and categorization within the collection.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {liveCollection?.contentfulMetadata?.tags?.length ? 
                    `${liveCollection.contentfulMetadata.tags.length} tag(s) configured` : 
                    'No tags set'
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
