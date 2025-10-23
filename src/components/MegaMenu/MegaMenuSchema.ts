import { z } from 'zod';

import { MenuItemSchema } from '@/components/MenuItem/MenuItemSchema';

export const MegaMenuSchema = z.object({
  sys: z.object({
    id: z.string()
  }),

  overflow: z.boolean().optional(),
  title: z.string(),
  itemsCollection: z
    .object({
      items: z.array(MenuItemSchema)
    })
    .optional(),
  contentfulMetadata: z
    .object({
      tags: z.array(
        z.object({
          id: z.string(),
          name: z.string()
        })
      )
    })
    .optional(),
  __typename: z.string()
});

export type MegaMenu = z.infer<typeof MegaMenuSchema>;

export interface MegaMenuResponse {
  items: MegaMenu[];
  total: number;
}
