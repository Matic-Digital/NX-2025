'use client';

import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { MuxVideoPlayer } from '@/components/Video/MuxVideo';
import { videoFields } from '@/components/Video/preview/VideoFields';

import type { Video } from '@/components/Video/VideoSchema';

/**
 * Video Preview Component
 *
 * This component is used in Contentful Live Preview to display Video components
 * with a live preview and field breakdown.
 */
export function VideoPreview(props: Partial<Video>) {
  // Contentful Live Preview integration
  const liveVideo = useContentfulLiveUpdates(props);
  
  console.log('⭐ VideoPreview: Received props:', props);
  console.log('⭐ VideoPreview: Live video data:', liveVideo);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-cyan-100 text-cyan-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Video
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have the minimum required fields
                const hasMinimumFields = liveVideo?.sys && liveVideo?.playbackId;

                if (hasMinimumFields) {
                  return (
                    <div className="p-8">
                      <div className="max-w-4xl mx-auto">
                        <h3 className="text-lg font-semibold mb-4 text-gray-600">
                          Preview (video)
                        </h3>

                        {/* Video Preview */}
                        <MuxVideoPlayer {...(liveVideo as Video)} />
                      </div>
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when the video is configured.</p>
                    <p className="text-sm mt-2">
                      Add a playback ID and optional title for best results.
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown title="Video Fields" fields={videoFields} data={liveVideo} />
        </div>
      </div>
    </div>
  );
}
