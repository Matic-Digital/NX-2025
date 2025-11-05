'use client';

import { useEffect, useState } from 'react';
import MuxVideo from '@mux/mux-video-react';

import { getVideoById as _getVideoById } from '@/components/Video/VideoApi';

import type { Video, VideoSys } from '@/components/Video/VideoSchema';

// Type guard to check if props is a full Video object
function isFullVideo(props: VideoSys | Video): props is Video {
  return 'muxVideo' in props;
}

export function MuxVideoPlayer(props: VideoSys | Video) {
  const [videoData, setVideoData] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If we already have full video data, use it directly
    if (isFullVideo(props)) {
      setVideoData(props);
      setLoading(false);
      return;
    }

    // Otherwise, fetch the full video data
    const fetchVideoData = async () => {
      try {
        setLoading(true);
        // Use internal API route instead of direct Contentful call
        const response = await fetch(`/api/components/Video/${props.sys.id}`);
        if (response.ok) {
          const data = await response.json();
          setVideoData(data.video);
        }
      } catch (error) {
        console.warn('Error in catch block:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchVideoData();
  }, [props]);

  if (loading) {
    return <div>Loading video...</div>;
  }

  if (!videoData) {
    return <div>Video not found</div>;
  }

  // Validate that we have a playback ID
  if (!videoData.muxVideo?.playbackId) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-gray-600">Video playback ID not available</p>
          <p className="text-sm text-gray-500 mt-1">Title: {videoData.title}</p>
        </div>
      </div>
    );
  }

  return (
    <MuxVideo
      playbackId={videoData.muxVideo.playbackId}
      metadata={{
        video_id: videoData.sys.id,
        video_title: videoData.title
      }}
      controls
      muted
      poster={videoData.posterImage?.link}
      className="h-full w-full"
    />
  );
}
