import { z } from 'zod';

import { AssetSchema } from '@/components/Asset/AssetSchema';
import { MenuSchema } from '@/components/Menu/MenuSchema';
import { PageListSchema } from '@/components/PageList/PageListSchema';
import { SocialSchema } from '@/components/Social/SocialSchema';

export const FooterSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  logo: AssetSchema.optional(),
  description: z.string().optional(),
  pageListsCollection: z
    .object({
      items: z.array(PageListSchema)
    })
    .optional(),
  menusCollection: z
    .object({
      items: z.array(MenuSchema)
    })
    .optional(),
  copyright: z.string().optional(),
  legalPageListsCollection: z
    .object({
      items: z.array(PageListSchema)
    })
    .optional(),
  socialNetworksCollection: z
    .object({
      items: z.array(SocialSchema)
    })
    .optional(),
  __typename: z.string().optional()
});

export type Footer = z.infer<typeof FooterSchema>;

export interface FooterResponse {
  items: Array<Footer>;
  total: number;
}
