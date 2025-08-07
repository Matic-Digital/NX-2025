/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports, import/no-dynamic-require, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { z } from 'zod';
import { CtaBannerSchema } from './CtaBanner';
import { ContentGridSchema } from './ContentGrid';
import { BannerHeroSchema } from './BannerHero';
import { ImageBetweenSchema } from './ImageBetween';
import { PageSchema } from './Page';
import { ExternalPageSchema } from './ExternalPage';

const PageListPagesUnion = z.union([PageSchema, ExternalPageSchema]);
export type PageListPages = z.infer<typeof PageListPagesUnion>;

const PageListContentUnion = z.union([
  BannerHeroSchema,
  ContentGridSchema,
  CtaBannerSchema,
  ImageBetweenSchema
]);
export type PageListContent = z.infer<typeof PageListContentUnion>;

export const PageListSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string().optional(),
  slug: z.string().optional(),
  pagesCollection: z
    .object({
      items: z.array(PageListPagesUnion)
    })
    .optional(),
  header: z.lazy(() => require('./Header').HeaderSchema).optional(),
  pageContentCollection: z
    .object({
      items: z.array(PageListContentUnion)
    })
    .optional(),
  footer: z.lazy(() => require('./Footer').FooterSchema).optional(),
  __typename: z.string().optional()
});

export type PageList = z.infer<typeof PageListSchema>;

export const PageListWithRefsSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string().optional(),
  slug: z.string().optional(),
  pagesCollection: z
    .object({
      items: z.array(PageSchema)
    })
    .optional(),
  header: z
    .object({
      sys: z.object({
        id: z.string()
      }),
      __typename: z.string()
    })
    .optional(),
  pageContentCollection: z
    .object({
      items: z.array(PageListContentUnion)
    })
    .optional(),
  footer: z
    .object({
      sys: z.object({
        id: z.string()
      }),
      __typename: z.string()
    })
    .optional(),
  __typename: z.string().optional()
});

export type PageListWithRefs = z.infer<typeof PageListWithRefsSchema>;

export interface PageListResponse {
  items: Array<PageList>;
  total: number;
}
