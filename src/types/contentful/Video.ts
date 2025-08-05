import { z } from 'zod';

// a video from Mux

export const VideoSysSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  __typename: z.string().optional()
});

export const VideoSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  id: z.string(),
  playbackId: z.string(),
  __typename: z.string().optional()
});

export type Video = z.infer<typeof VideoSchema>;
export type VideoSys = z.infer<typeof VideoSysSchema>;

export interface VideoResponse {
  items: Video[];
}
