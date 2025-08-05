import z from 'zod';
import { AssetSchema } from './Asset';
import { ContentGridSchema } from './ContentGrid';
import { ImageSchema } from './Image';
import { SliderSysSchema } from './Slider';

export const ImageBetweenSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  contentTop: ContentGridSchema,
  asset: z.union([ImageSchema, SliderSysSchema]),
  backgroundMedia: AssetSchema,
  contentBottom: ContentGridSchema,
  __typename: z.string().optional()
});

export type ImageBetween = z.infer<typeof ImageBetweenSchema>;

export interface ImageBetweenResponse {
  items: ImageBetween[];
}
