/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports, import/no-dynamic-require, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { z } from 'zod';
import { CtaBannerSchema } from './CtaBanner';
import { ContentGridSchema } from './ContentGrid';
import { BannerHeroSchema } from './BannerHero';
import { ImageBetweenSchema } from './ImageBetween';
import { PageSchema } from './Page';
import { ExternalPageSchema } from './ExternalPage';
import { ContentSchema } from './Content';

const PageListPagesUnion = z.union([PageSchema, ExternalPageSchema]);
export type PageListPages = z.infer<typeof PageListPagesUnion>;

const PageListContentUnion = z.union([
  BannerHeroSchema,
  ContentSchema,
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
  pageLayout: z.lazy(() => require('./PageLayout').PageLayoutSchema).optional(),
  pagesCollection: z
    .object({
      items: z.array(PageListPagesUnion)
    })
    .optional(),
  pageContentCollection: z
    .object({
      items: z.array(PageListContentUnion)
    })
    .optional(),
  __typename: z.string().optional()
});

export type PageList = z.infer<typeof PageListSchema>;

export const PageListWithRefsSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string().optional(),
  slug: z.string().optional(),
  pageLayout: z.lazy(() => require('./PageLayout').PageLayoutSchema).optional(),
  pagesCollection: z
    .object({
      items: z.array(PageSchema)
    })
    .optional(),
  pageContentCollection: z
    .object({
      items: z.array(PageListContentUnion)
    })
    .optional(),
  __typename: z.string().optional()
});

export type PageListWithRefs = z.infer<typeof PageListWithRefsSchema>;

export interface PageListResponse {
  items: Array<PageList>;
  total: number;
}
