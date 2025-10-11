import z from 'zod';

import { AssetSchema } from '@/components/Asset/AssetSchema';
import { BannerHeroSchema } from '@/components/BannerHero/BannerHeroSchema';
import { ContentGridSchema } from '@/components/ContentGrid/ContentGridSchema';
import { ImageSchema } from '@/components/Image/ImageSchema';
import { SliderSysSchema } from '@/components/Slider/SliderSchema';
import { VideoSchema } from '@/components/Video/VideoSchema';

const ImageBetweenAssetUnion = z.union([
  ImageSchema,
  SliderSysSchema,
  VideoSchema,
  ContentGridSchema
]);
export type ImageBetweenAsset = z.infer<typeof ImageBetweenAssetUnion>;

export const ImageBetweenSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  contentTop: z.union([ContentGridSchema, BannerHeroSchema]),
  asset: ImageBetweenAssetUnion,
  backgroundMedia: AssetSchema,
  contentBottom: ContentGridSchema,
  __typename: z.string().optional()
});

export type ImageBetween = z.infer<typeof ImageBetweenSchema>;

export interface ImageBetweenResponse {
  items: ImageBetween[];
}
