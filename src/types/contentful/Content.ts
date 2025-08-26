import { z } from 'zod';
import { ProductSchema } from './Product';
import { SectionHeadingSchema } from './SectionHeading';
import { ImageSchema } from './Image';
import { VideoSchema } from './Video';

const ContentItemUnion = z.union([ProductSchema, SectionHeadingSchema]);
export type ContentItem = z.infer<typeof ContentItemUnion>;

const ContentAssetUnion = z.union([ImageSchema, VideoSchema]);
export type ContentAsset = z.infer<typeof ContentAssetUnion>;

export const ContentVariantEnum = z.enum([
  'ContentLeft',
  'ContentCenter',
  'ContentRight',
  'FullWidth'
]);
export type ContentVariant = z.infer<typeof ContentVariantEnum>;

export const ContentSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  variant: ContentVariantEnum.optional(),
  asset: ContentAssetUnion.optional(),
  item: ContentItemUnion,
  __typename: z.string().optional()
});

export type Content = z.infer<typeof ContentSchema>;

export interface ContentResponse {
  items: Content[];
}
