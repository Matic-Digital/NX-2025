 
import { z } from 'zod';

import { AssetSchema } from '@/components/Asset/AssetSchema';
import { BannerHeroSchema } from '@/components/BannerHero/BannerHeroSchema';
import { ContentSchema } from '@/components/Content/ContentSchema';
import { ContentGridSchema } from '@/components/ContentGrid/ContentGridSchema';
import { CtaBannerSchema } from '@/components/CtaBanner/CtaBannerSchema';
import { ImageSchema } from '@/components/Image/ImageSchema';
import { ImageBetweenSchema } from '@/components/ImageBetween/ImageBetweenSchema';

export const ProductSysSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  __typename: z.string().optional()
});

// Product content union for items field
const ProductContentUnion = z.union([
  BannerHeroSchema,
  ContentSchema,
  ContentGridSchema,
  CtaBannerSchema,
  ImageBetweenSchema
]);

export type ProductContent = z.infer<typeof ProductContentUnion>;

export const ProductSchema: z.ZodType<{
  sys: {
    id: string;
    contentType?: {
      sys: {
        id: string;
      };
    };
    updatedAt?: string;
  };
  title: string;
  slug: string;
  tags?: string[];
  description?: string;
  icon?: z.infer<typeof AssetSchema>;
  image?: z.infer<typeof ImageSchema>;
  pageLayout?: any;
  itemsCollection?: {
    items: ProductContent[];
  };
  __typename?: string;
}> = z.object({
  sys: z.object({
    id: z.string(),
    contentType: z
      .object({
        sys: z.object({
          id: z.string()
        })
      })
      .optional(),
    updatedAt: z.string().optional()
  }),
  title: z.string(),
  slug: z.string(),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  icon: AssetSchema.optional(),
  image: ImageSchema.optional(),
  pageLayout: z.lazy(() => require('./PageLayoutSchema').PageLayoutSchema).optional(),
  itemsCollection: z
    .object({
      items: z.array(ProductContentUnion)
    })
    .optional(),
  __typename: z.string().optional()
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductSys = z.infer<typeof ProductSysSchema>;

export interface ProductResponse {
  items: Product[];
}
