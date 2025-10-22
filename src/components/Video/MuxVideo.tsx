'use client';

import { useEffect, useState } from 'react';
import MuxVideo from '@mux/mux-video-react';

import { getVideoById } from '@/components/Video/VideoApi';

import type { Video, VideoSys } from '@/components/Video/VideoSchema';

// Type guard to check if props is a full Video object
function isFullVideo(props: VideoSys | Video): props is Video {
  return 'playbackId' in props;
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
        const video = await getVideoById(props.sys.id);
        if (video) {
          setVideoData(video);
        }
      } catch (error) {
        console.error('⭐ MuxVideoPlayer: Error fetching video data:', error);
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

  return (
    <MuxVideo
      playbackId={videoData.playbackId}
      metadata={{
        video_id: videoData.id,
        video_title: videoData.title
      }}
      controls
      muted
      poster={videoData.posterImage?.link}
      className="h-full w-full"
    />
  );
}
