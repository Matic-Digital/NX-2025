import { z } from 'zod';
import { AssetSchema } from './Asset';

export const ProductSysSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  __typename: z.string().optional()
});

export const ProductSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  slug: z.string(),
  icon: AssetSchema.optional(),
  description: z.string().optional(),
  __typename: z.string().optional()
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductSys = z.infer<typeof ProductSysSchema>;

export interface ProductResponse {
  items: Product[];
}
