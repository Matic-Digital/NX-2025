import { z } from 'zod';
import { MenuItemSchema } from '../MenuItem/MenuItemSchema';

export const MegaMenuSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  __typename: z.string(),
  overflow: z.boolean().optional(),
  title: z.string(),
  itemsCollection: z.object({
    items: z.array(MenuItemSchema)
  }).optional(),
});

export type MegaMenu = z.infer<typeof MegaMenuSchema>;

export interface MegaMenuResponse {
  items: MegaMenu[];
  total: number;
}
