import { z } from 'zod';

import { ImageSchema } from '@/components/Image/ImageSchema';
import { VideoSchema } from '@/components/Video/VideoSchema';

export const TimelineSliderItemSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  year: z.string().optional(),
  description: z.string().optional(),
  asset: z.union([ImageSchema, VideoSchema]).optional(),
  __typename: z.string().optional()
});

export type TimelineSliderItem = z.infer<typeof TimelineSliderItemSchema>;
