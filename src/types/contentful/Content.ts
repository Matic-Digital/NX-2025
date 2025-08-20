import { z } from 'zod';
import { PostSchema } from './Post';
import { ProductSchema } from './Product';
import { SectionHeadingSchema } from './SectionHeading';
import { ImageSchema } from './Image';
import { VideoSchema } from './Video';

const ContentItemUnion = z.union([PostSchema, ProductSchema, SectionHeadingSchema]);
export type ContentItem = z.infer<typeof ContentItemUnion>;

const ContentAssetUnion = z.union([ImageSchema, VideoSchema]);
export type ContentAsset = z.infer<typeof ContentAssetUnion>;

export const ContentSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  asset: ContentAssetUnion.optional(),
  item: ContentItemUnion,
  __typename: z.string().optional()
});

export type Content = z.infer<typeof ContentSchema>;

export interface ContentResponse {
  items: Content[];
}
