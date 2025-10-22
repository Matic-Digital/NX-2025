'use client';

import { useState } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { PostCard } from '@/components/Post/PostCard';
import { PostDetail } from '@/components/Post/PostDetail';
import { postFields } from '@/components/Post/preview/PostFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { Post } from '@/components/Post/PostSchema';

type PreviewMode = 'card' | 'detail';

/**
 * This component is used in Contentful Live Preview to display Post components
 * with a live preview and field breakdown.
 */
export function PostPreview(props: Partial<Post>) {
  // Contentful Live Preview integration
  const livePost = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: livePost?.sys?.id });
  
  // Toggle state for preview mode
  const [previewMode, setPreviewMode] = useState<PreviewMode>('detail');

  // Check if we have all required fields for a valid Post
  const hasRequiredFields =
    livePost?.sys &&
    livePost?.title &&
    livePost?.slug &&
    livePost?.content &&
    livePost?.categories &&
    livePost.categories.length > 0;

  return (
    <div className="min-h-screen relative">
      {/* Floating toggle button - always visible */}
      <div className="fixed top-4 right-4 z-[9999] pointer-events-auto">
        <div className="flex bg-white rounded-lg border border-gray-300 shadow-lg p-1">
          <button
            onClick={() => setPreviewMode('card')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              (previewMode as string) === 'card'
                ? 'bg-purple-100 text-purple-800'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Post
          </button>
          <button
            onClick={() => setPreviewMode('detail')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              (previewMode as string) === 'detail'
                ? 'bg-purple-100 text-purple-800'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Detail
          </button>
        </div>
      </div>

      {/* Detail view - full page layout without field breakdown */}
      {previewMode === 'detail' ? (
        hasRequiredFields ? (
          <PostDetail post={livePost as Post} />
        ) : (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview Not Available</h2>
              <p className="text-gray-600 mb-4">Detail preview will appear when all required fields are configured:</p>
              <ul className="text-sm text-gray-500 space-y-1">
                {!livePost?.title && <li>• Title is required</li>}
                {!livePost?.slug && <li>• Slug is required</li>}
                {!livePost?.content && <li>• Content is required</li>}
                {(!livePost?.categories || livePost.categories.length === 0) && (
                  <li>• At least one category is required</li>
                )}
              </ul>
            </div>
          </div>
        )
      ) : (
        /* Card view - component preview with field breakdown */
        <div className="min-h-screen bg-gray-50">
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              {/* Live Component Preview */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="overflow-hidden">
                  {hasRequiredFields && livePost.sys ? (
                    <div className="overflow-hidden p-6 max-w-xl mx-auto">
                      <div className="grid gap-6">
                        <PostCard sys={{ id: livePost.sys.id }} {...inspectorProps} />
                      </div>
                    </div>
                  ) : (
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
                  )}
                </div>
              </div>

              {/* Field Breakdown - only shown in card view */}
              <FieldBreakdown fields={postFields} data={livePost} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
