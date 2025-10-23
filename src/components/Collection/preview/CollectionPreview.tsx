'use client';

import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { Collection } from '@/components/Collection/Collection';
import { collectionFields } from '@/components/Collection/preview/CollectionFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { LivePreview } from '@/components/Preview/LivePreview';

import type { Collection as CollectionType } from '@/components/Collection/CollectionSchema';

/**
 * Collection Preview Component
 *
 * This component is used in Contentful Live Preview to display Collection components
 * with a live preview and field breakdown.
 */
export function CollectionPreview(props: Partial<CollectionType>) {
  // Contentful Live Preview integration
  const liveCollection = useContentfulLiveUpdates(props);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <LivePreview
            componentName="Collection"
            data={liveCollection}
            requiredFields={['sys', 'title']}
          >
            <Collection
              collectionData={liveCollection as CollectionType}
              sys={liveCollection.sys}
            />
          </LivePreview>

          {/* Field Breakdown */}
          <FieldBreakdown fields={collectionFields} data={liveCollection} />
        </div>
      </div>
    </div>
  );
}
