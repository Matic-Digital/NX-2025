import type { FieldConfig } from '@/components/Preview/FieldBreakdown';
import type { Video } from '@/components/Video/VideoSchema';

export const videoFields: FieldConfig<Partial<Video>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'Display title for the video.',
    color: 'blue',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'muxVideo',
    label: 'Mux Video',
    required: true,
    description: 'Mux video configuration object.',
    color: 'green',
    getValue: (data) => {
      if (!data.muxVideo) return 'Not set';
      const playbackId = data.muxVideo.playbackId;
      return playbackId ? `Playback ID: "${playbackId}"` : 'Mux video configured (no playback ID)';
    }
  },
  {
    name: 'id',
    label: 'Video ID',
    required: true,
    description: 'Internal video identifier for tracking.',
    color: 'purple',
    getValue: (data) => (data.id ? `"${data.id}"` : 'Not set')
  },
  {
    name: 'posterImage',
    label: 'Poster Image',
    required: false,
    description: 'Thumbnail image displayed before video plays.',
    color: 'orange',
    getValue: (data) => {
      if (!data.posterImage) {
        return 'Not set';
      }
      return data.posterImage.title ? `Image: ${data.posterImage.title}` : 'Image configured';
    }
  }
];
