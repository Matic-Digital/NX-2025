import { z } from 'zod';

// Base schema for common fields
const BaseItemSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  __typename: z.string(),
});

// MenuItem schema for discriminated union
const MenuItemInUnionSchema = BaseItemSchema.extend({
  __typename: z.literal('MenuItem'),
  title: z.string(),
  text: z.string(),
  description: z.string(),
  icon: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    url: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
    __typename: z.string()
  }).optional(),
  internalLink: z.object({
    sys: z.object({
      id: z.string()
    }),
    slug: z.string(),
    __typename: z.string()
  }).optional(),
  externalLink: z.string().url().optional(),
});

// MegaMenu schema for discriminated union (lazy loaded - no items)
const MegaMenuInUnionSchema = BaseItemSchema.extend({
  __typename: z.literal('MegaMenu'),
  title: z.string(),
  overflow: z.boolean().optional(),
});

// Discriminated union type for menu items
const MenuItemUnionSchema = z.discriminatedUnion('__typename', [
  MenuItemInUnionSchema,
  MegaMenuInUnionSchema
]);

export const MenuSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  __typename: z.string(),
  title: z.string(),
  itemsCollection: z.object({
    items: z.array(MenuItemUnionSchema)
  }),
});

export type Menu = z.infer<typeof MenuSchema>;

export interface MenuResponse {
  items: Menu[];
  total: number;
}
