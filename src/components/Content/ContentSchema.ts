import { z } from 'zod';
import { ProductSchema } from '../../types/contentful/Product';
import { SectionHeadingSchema } from '../SectionHeading/SectionHeadingSchema';
import { ImageSchema } from '../../types/contentful/Image';
import { VideoSchema } from '../../types/contentful/Video';
import { ContentGridItemSchema } from '../../types/contentful/ContentGridItem';
import { ContentVariantEnum } from './ContentVariant';

const ContentItemUnion = z.union([ProductSchema, SectionHeadingSchema, ContentGridItemSchema]);
export type ContentItem = z.infer<typeof ContentItemUnion>;

const ContentAssetUnion = z.union([ImageSchema, VideoSchema]);
export type ContentAsset = z.infer<typeof ContentAssetUnion>;

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

export type ContentOverlay = {
  children: React.ReactNode;
};

export interface ContentResponse {
  items: Content[];
}
