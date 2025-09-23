import { z } from 'zod';

import { ImageSchema } from '@/components/Image/ImageSchema';
import { PostSliderItemSchema } from '@/components/Post/PostSchema';
import { SliderItemSchema } from '@/components/Slider/SliderItemSchema';
import { SolutionSchema } from '@/components/Solution/SolutionSchema';
import { TeamMemberSchema } from '@/components/TeamMember/TeamMemberSchema';
import { TimelineSliderItemSchema } from '@/components/TimelineSlider/TimelineSliderItemSchema';

// Union type for slider items
const SliderItemUnion = z.union([
  SliderItemSchema,
  PostSliderItemSchema,
  ImageSchema,
  SliderItemSchema,
  TimelineSliderItemSchema,
  TeamMemberSchema,
  SolutionSchema
]);

export type SliderItemType = z.infer<typeof SliderItemUnion>;

export const SliderSysSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  __typename: z.string().optional()
});

export type SliderSys = z.infer<typeof SliderSysSchema>;

export const SliderSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  itemsCollection: z.object({
    items: z.array(SliderItemUnion)
  }),
  __typename: z.string().optional()
});

export type Slider = z.infer<typeof SliderSchema>;

export interface SliderResponse {
  items: Slider[];
}
