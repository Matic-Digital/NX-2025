/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any */
import { z } from 'zod';
import { AssetSchema } from '../Asset/AssetSchema';
import { ImageSchema } from '../Image/ImageSchema';
import { CtaBannerSchema } from '../CtaBanner/CtaBannerSchema';
import { ContentGridSchema } from '../ContentGrid/ContentGridSchema';
import { BannerHeroSchema } from '../BannerHero/BannerHeroSchema';
import { ImageBetweenSchema } from '../ImageBetween/ImageBetweenSchema';
import { ContentSchema } from '../Content/ContentSchema';

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
