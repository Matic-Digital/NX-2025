'use client';

import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { LivePreview } from '@/components/Preview/LivePreview';
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <LivePreview
            componentName="Video"
            data={liveVideo}
            requiredFields={['sys', 'muxVideo']}
          >
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-lg font-semibold mb-4 text-gray-600">Preview (video)</h3>

                {/* Video Preview */}
                <MuxVideoPlayer {...(liveVideo as Video)} />
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
