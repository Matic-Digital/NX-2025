'use client';

import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { LivePreview } from '@/components/Preview/LivePreview';
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
  
  // Debug: Log what data we're getting
  console.log('🔍 VideoPreview liveVideo data:', liveVideo);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <LivePreview
            componentName="Video"
            data={liveVideo}
            requiredFields={['sys', 'title', 'playbackId']}
          >
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-lg font-semibold mb-4 text-gray-600">
                  Preview (video)
                </h3>

                {/* Video Preview - Simple preview without API calls */}
                <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold mb-2">{liveVideo.title}</h4>
                      <p className="text-sm text-gray-300">Playback ID: {liveVideo.playbackId}</p>
                      <p className="text-xs text-green-400 mt-2">✅ Video Preview Ready</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </LivePreview>

          {/* Field Breakdown */}
          <FieldBreakdown title="Video Fields" fields={videoFields} data={liveVideo} />
        </div>
      </div>
    </div>
  );
}
