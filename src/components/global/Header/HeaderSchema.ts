import { z } from 'zod';
import { AssetSchema } from '../../../types/contentful/Asset';
import { PageSchema } from '../Page/PageSchema';
import { PageListSchema } from '../PageList/PageListSchema';

const NavLinksUnion = z.union([PageSchema, PageListSchema]);

export const HeaderSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  name: z.string().optional(),
  logo: AssetSchema.optional(),
  navLinksCollection: z
    .object({
      items: z.array(NavLinksUnion)
    })
    .optional(),
  __typename: z.string().optional()
});

export type Header = z.infer<typeof HeaderSchema>;

export interface HeaderResponse {
  items: Array<Header>;
  total: number;
}
