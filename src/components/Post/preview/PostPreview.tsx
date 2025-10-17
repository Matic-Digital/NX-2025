'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { PostCard } from '@/components/Post/PostCard';
import { postFields } from '@/components/Post/preview/PostFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { Post } from '@/components/Post/PostSchema';

/**
 * This component is used in Contentful Live Preview to display Post components
 * with a live preview and field breakdown.
 */
export function PostPreview(props: Partial<Post>) {
  // Contentful Live Preview integration
  const livePost = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: livePost?.sys?.id });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Live Component Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Post
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid Post
                const hasRequiredFields =
                  livePost?.sys &&
                  livePost?.title &&
                  livePost?.slug &&
                  livePost?.content &&
                  livePost?.categories &&
                  livePost.categories.length > 0;

                if (hasRequiredFields && livePost.sys) {
                  return (
                    <div className="overflow-hidden p-6 max-w-xl mx-auto">
                      <div className="grid gap-6">
                        <PostCard sys={{ id: livePost.sys.id }} {...inspectorProps} />
                      </div>
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!livePost?.title && <li>• Title is required</li>}
                      {!livePost?.slug && <li>• Slug is required</li>}
                      {!livePost?.content && <li>• Content is required</li>}
                      {(!livePost?.categories || livePost.categories.length === 0) && (
                        <li>• At least one category is required</li>
                      )}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={postFields} data={livePost} />
        </div>
      </div>
    </div>
  );
}
