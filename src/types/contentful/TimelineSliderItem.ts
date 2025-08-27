import { z } from 'zod';
import { ImageSchema } from './Image';
import { VideoSchema } from './Video';

export const TimelineSliderItemSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  year: z.string(),
  description: z.string(),
  asset: z.union([ImageSchema, VideoSchema]),
  __typename: z.string().optional()
});

export type TimelineSliderItem = z.infer<typeof TimelineSliderItemSchema>;
