import z from 'zod';
import { AssetSchema } from '../../types/contentful/Asset';
import { ContentGridSchema } from '../ContentGrid/ContentGridSchema';
import { ImageSchema } from '../../types/contentful/Image';
import { SliderSysSchema } from '../Slider/SliderSchema';
import { VideoSchema } from '../../types/contentful/Video';

const ContentAssetUnion = z.union([ImageSchema, SliderSysSchema, VideoSchema, ContentGridSchema]);
export type ContentAsset = z.infer<typeof ContentAssetUnion>;

export const ImageBetweenSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  contentTop: ContentGridSchema,
  asset: ContentAssetUnion,
  backgroundMedia: AssetSchema,
  contentBottom: ContentGridSchema,
  __typename: z.string().optional()
});

export type ImageBetween = z.infer<typeof ImageBetweenSchema>;

export interface ImageBetweenResponse {
  items: ImageBetween[];
}
