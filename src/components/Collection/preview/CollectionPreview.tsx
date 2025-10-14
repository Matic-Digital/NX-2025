'use client';

import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { Collection } from '@/components/Collection/Collection';
import { collectionFields } from '@/components/Collection/preview/CollectionFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { Collection as CollectionType } from '@/components/Collection/CollectionSchema';

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
          <FieldBreakdown fields={collectionFields} data={liveCollection} />
        </div>
      </div>
    </div>
  );
}
