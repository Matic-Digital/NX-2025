import { z } from 'zod';
import { ImageSchema } from '../../types/contentful/Image';
import { SliderItemSchema } from './SliderItemSchema';
import { TimelineSliderItemSchema } from '../../types/contentful/TimelineSliderItem';
import { TeamMemberSchema } from '../../types/contentful/TeamMember';
import { PostSliderItemSchema } from '../Post/PostSchema';
import { SolutionSchema } from '../../types/contentful/Solution';

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
