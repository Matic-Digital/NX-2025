import { z } from 'zod';

import { ImageSchema } from '@/components/Image/ImageSchema';

// a video from Mux

export const VideoSysSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  __typename: z.string().optional()
});

export type VideoSys = z.infer<typeof VideoSysSchema>;

export const VideoSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  id: z.string(),
  muxVideo: z.object({
    playbackId: z.string().optional(),
    assetId: z.string().optional(),
    uploadId: z.string().optional()
  }).refine(
    (data) => data.playbackId ?? data.assetId ?? data.uploadId,
    {
      message: "muxVideo must have at least one of: playbackId, assetId, or uploadId"
    }
  ),
  posterImage: ImageSchema.optional(),
  __typename: z.string().optional()
});

export type Video = z.infer<typeof VideoSchema>;

export interface VideoResponse {
  items: Video[];
}
