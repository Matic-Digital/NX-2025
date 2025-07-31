import MuxVideoPlayer from '@mux/mux-video-react';
import type { Video } from '@/types/contentful';

export function MuxVideo(props: Video) {
  return (
    <MuxVideoPlayer
      playbackId={props.playbackId}
      metadata={{
        video_id: props.id,
        video_title: props.title
      }}
      className="h-full w-full"
    />
  );
}
