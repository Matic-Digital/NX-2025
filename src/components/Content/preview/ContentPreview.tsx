'use client';

import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { Content } from '@/components/Content/Content';
import { contentFields } from '@/components/Content/preview/ContentFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { Content as ContentType } from '@/components/Content/ContentSchema';

type ContentPreviewProps = (Partial<ContentType> | { item: ContentType }) & {
  contentId?: string;
};

/**
 * Content Preview Component
 *
 * This component is used in Contentful Live Preview to display Content components
 * with a live preview and field breakdown.
 */
export function ContentPreview(props: ContentPreviewProps) {
  // Unwrap the item property if it exists (API returns {item: Content})
  const contentData = 'item' in props && props.item ? props.item : props;

  // Contentful Live Preview integration
  const rawLiveContent = useContentfulLiveUpdates(contentData);
  const liveContent = rawLiveContent as Partial<ContentType>;

  // Debug logging
  console.log('ContentPreview - props:', props);
  console.log('ContentPreview - contentData:', contentData);
  console.log('ContentPreview - liveContent:', liveContent);

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
              {liveContent?.sys &&
              liveContent?.title &&
              liveContent?.variant &&
              liveContent?.item ? (
                <Content {...(liveContent as ContentType)} />
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>Preview will appear when all required fields are configured:</p>
                  <ul className="mt-2 text-sm">
                    {!liveContent?.sys && <li>• Content ID is required</li>}
                    {!liveContent?.title && <li>• Title is required</li>}
                    {!liveContent?.variant && <li>• Variant is required</li>}
                    {!liveContent?.item && <li>• Item is required</li>}
                  </ul>
                  {/* Debug info */}
                  <div className="mt-4 text-xs text-gray-400">
                    <p>
                      Debug: sys={liveContent?.sys?.id ? '✓' : '✗'}, title=
                      {liveContent?.title ? '✓' : '✗'}, variant=
                      {liveContent?.variant ? '✓' : '✗'}, item={liveContent?.item ? '✓' : '✗'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={contentFields} data={liveContent} />
        </div>
      </div>
    </div>
  );
}
