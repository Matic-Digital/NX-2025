import { z } from 'zod';
import { AssetSchema } from './Asset';
import { ImageSchema } from './Image';

export const ProductSysSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  __typename: z.string().optional()
});

export const ProductSchema = z.object({
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
  __typename: z.string().optional()
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductSys = z.infer<typeof ProductSysSchema>;

export interface ProductResponse {
  items: Product[];
}
