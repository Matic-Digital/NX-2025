import { z } from 'zod';
import { AssetSchema } from './Asset';
import { PageSchema } from './Page';
import { PageListSchema } from './PageList';

const NavLinksUnion = z.union([PageSchema, PageListSchema]);

export const HeaderSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  name: z.string(),
  logo: AssetSchema,
  navLinksCollection: z
    .object({
      items: z.array(NavLinksUnion)
    })
    .optional(),
  menu: z.object({
    sys: z.object({
      id: z.string()
    }),
    __typename: z.string()
  }).optional(),
  search: z.boolean().optional(),
  overflow: z.object({
    sys: z.object({
      id: z.string()
    }),
    __typename: z.string()
  }).optional(),
  __typename: z.string().optional()
});

export type Header = z.infer<typeof HeaderSchema>;

export interface HeaderResponse {
  items: Array<Header>;
  total: number;
}
