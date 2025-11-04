import { z } from 'zod';

import { ContentVariantEnum } from '@/components/Content/ContentVariant';
import { ContentGridItemSchema } from '@/components/ContentGrid/ContentGridItemSchema';
import { HubspotFormSchema } from '@/components/Forms/HubspotForm/HubspotFormSchema';
import { ImageSchema } from '@/components/Image/ImageSchema';
import { ProductSchema } from '@/components/Product/ProductSchema';
import { SectionHeadingSchema } from '@/components/SectionHeading/SectionHeadingSchema';
import { VideoSchema } from '@/components/Video/VideoSchema';

const ContentItemUnion = z.union([
  ContentGridItemSchema,
  HubspotFormSchema,
  ProductSchema,
  SectionHeadingSchema
]);
export type ContentItem = z.infer<typeof ContentItemUnion>;

const ContentAssetUnion = z.union([ImageSchema, VideoSchema]);
export type ContentAsset = z.infer<typeof ContentAssetUnion>;

export const ContentSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  variant: ContentVariantEnum,
  asset: ContentAssetUnion.optional(),
  item: ContentItemUnion,
  __typename: z.string().optional()
});

export type Content = z.infer<typeof ContentSchema>;

export type ContentOverlay = {
  children: React.ReactNode;
  className?: string;
};

export interface ContentResponse {
  items: Content[];
}
