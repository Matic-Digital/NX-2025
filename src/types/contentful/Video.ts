import { z } from 'zod';

// a video from Mux
export const VideoSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  playbackId: z.string(),
  id: z.string(),
  title: z.string(),
  __typename: z.string().optional()
});

export type Video = z.infer<typeof VideoSchema>;

export interface VideoResponse {
  items: Video[];
}
