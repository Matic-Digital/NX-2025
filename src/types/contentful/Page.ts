/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports, import/no-dynamic-require, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { z } from 'zod';
import { CtaBannerSchema } from './CtaBanner';
import { ContentGridSchema } from './ContentGrid';
import { BannerHeroSchema } from './BannerHero';
import { ImageBetweenSchema } from './ImageBetween';
import { ImageSchema } from './Image';

const PageContentUnion = z.union([
  BannerHeroSchema,
  ContentGridSchema,
  CtaBannerSchema,
  ImageSchema,
  ImageBetweenSchema
]);
export type PageContent = z.infer<typeof PageContentUnion>;

export const PageSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  header: z.lazy(() => require('./Header').HeaderSchema).optional(),
  pageContentCollection: z
    .object({
      items: z.array(PageContentUnion)
    })
    .optional(),
  footer: z.lazy(() => require('./Footer').FooterSchema).optional(),
  openGraphImage: z.lazy(() => require('./Image').ImageSchema).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  __typename: z.string().optional()
});

export type Page = z.infer<typeof PageSchema>;

export const PageWithRefsSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  header: z
    .object({
      sys: z.object({
        id: z.string()
      }),
      __typename: z.string()
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
  openGraphImage: z.lazy(() => require('./Image').ImageSchema).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  __typename: z.string().optional()
});

export type PageWithRefs = z.infer<typeof PageWithRefsSchema>;

export interface PageResponse {
  items: Page[];
  total: number;
}
