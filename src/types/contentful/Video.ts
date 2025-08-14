import { z } from 'zod';
import { ImageSchema } from './Image';

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
  playbackId: z.string(),
  posterImage: ImageSchema,
  __typename: z.string().optional()
});

export type Video = z.infer<typeof VideoSchema>;

export interface VideoResponse {
  items: Video[];
}
