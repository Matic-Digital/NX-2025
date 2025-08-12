import { z } from 'zod';
import { PostSchema } from './Post';
import { ProductSchema } from './Product';

const ContentItemUnion = z.union([PostSchema, ProductSchema]);
export type ContentItem = z.infer<typeof ContentItemUnion>;

export const ContentSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  item: ContentItemUnion,
  __typename: z.string().optional()
});

export type Content = z.infer<typeof ContentSchema>;

export interface ContentResponse {
  items: Content[];
}
