'use client';

import { useEffect, useState } from 'react';
import MuxVideo from '@mux/mux-video-react';
import { getVideosByIds } from '@/components/Video/VideoApi';
import type { Video, VideoSys } from '@/components/Video/VideoSchema';

export function MuxVideoPlayer(props: VideoSys) {
  const [videoData, setVideoData] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true);
        const videos = await getVideosByIds([props.sys.id]);
        if (videos.length > 0 && videos[0]) {
          setVideoData(videos[0]);
        }
      } catch (error) {
        console.error('Error fetching video data:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchVideoData();
  }, [props.sys.id]);

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
