import { z } from 'zod';

const MenuItemInternalLinkSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  slug: z.string(),
  __typename: z.string()
});

const AssetSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  url: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  __typename: z.string()
});

export const MenuItemSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  __typename: z.string(),
  icon: AssetSchema.optional(),
  title: z.string(),
  text: z.string(),
  description: z.string(),
  internalLink: MenuItemInternalLinkSchema.optional(),
  externalLink: z.optional(z.string().url())
});

export type MenuItem = z.infer<typeof MenuItemSchema>;

export interface MenuItemResponse {
  items: MenuItem[];
  total: number;
}
