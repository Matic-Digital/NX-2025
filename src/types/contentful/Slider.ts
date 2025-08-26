import { z } from 'zod';
import { SectionHeadingSchema } from './SectionHeading';
import { ImageSchema } from './Image';
import { FeatureSliderItemSchema } from './FeatureSliderItem';
import { TimelineSliderItemSchema } from './TimelineSliderItem';

const SliderItemSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  heading: SectionHeadingSchema,
  image: ImageSchema,
  __typename: z.string().optional()
});

export type SliderItem = z.infer<typeof SliderItemSchema>;

// Union type for slider items
const SliderItemUnion = z.union([
  SliderItemSchema,
  ImageSchema,
  FeatureSliderItemSchema,
  TimelineSliderItemSchema
]);

export type SliderItemOrImage = z.infer<typeof SliderItemUnion>;

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
