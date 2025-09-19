import { z } from 'zod';
import { PageListSchema } from '@/components/PageList/PageListSchema';
import { SocialSchema } from '@/components/Social/SocialSchema';

export const FooterSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  logo: z
    .object({
      url: z.string(),
      title: z.string().optional(),
      width: z.number().optional(),
      height: z.number().optional()
    })
    .optional(),
  description: z.string(),
  pageListsCollection: z
    .object({
      items: z.array(PageListSchema)
    })
    .optional(),
  copyright: z.string(),
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
