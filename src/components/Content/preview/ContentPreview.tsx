'use client';

import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { Content } from '@/components/Content/Content';
import { contentFields } from '@/components/Content/preview/ContentFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { LivePreview } from '@/components/Preview/LivePreview';

import type { Content as ContentType } from '@/components/Content/ContentSchema';

/**
 * Content Preview Component
 *
 * This component is used in Contentful Live Preview to display Content components
 * with a live preview and field breakdown.
 */
export function ContentPreview(props: Partial<ContentType>) {
  // Unwrap the item property if it exists (API returns {item: Content})
  const contentData = 'item' in props && props.item ? props.item : props;

  // Contentful Live Preview integration
  const rawLiveContent = useContentfulLiveUpdates(contentData);
  const liveContent = rawLiveContent as Partial<ContentType>;

  // Debug logging

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <LivePreview
            componentName="Content"
            data={liveContent}
            requiredFields={['sys', 'title', 'variant', 'item']}
          >
            <div className="p-8">
              <Content {...(liveContent as ContentType)} />
            </div>
          </LivePreview>

          {/* Field Breakdown */}
          <FieldBreakdown fields={contentFields} data={liveContent} />
        </div>
      </div>
    </div>
  );
}
