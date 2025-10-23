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

const ImageSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  __typename: z.string(),
  link: z.string(),
  altText: z.string().optional(),
  title: z.string().optional()
});

export const MenuItemSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  __typename: z.string(),
  icon: AssetSchema.optional(),
  associatedImage: ImageSchema.optional(),
  title: z.string(),
  text: z.string(),
  description: z.string().optional(),
  internalLink: MenuItemInternalLinkSchema.optional(),
  externalLink: z.string().url().optional()
});

export type MenuItem = z.infer<typeof MenuItemSchema>;

export interface MenuItemResponse {
  items: MenuItem[];
  total: number;
}
