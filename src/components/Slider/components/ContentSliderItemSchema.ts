import { z } from 'zod';

import { ImageSchema } from '@/components/Image/ImageSchema';

export const ContentSliderItemSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  image: ImageSchema,
  title: z.string(),
  description: z.string(),
  __typename: z.string().optional()
});

export type ContentSliderItem = z.infer<typeof ContentSliderItemSchema>;

export interface ContentSliderItemResponse {
  items: ContentSliderItem[];
}
