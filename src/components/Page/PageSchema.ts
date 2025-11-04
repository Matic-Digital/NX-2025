 
import { z } from 'zod';

import { BannerHeroSchema } from '@/components/BannerHero/BannerHeroSchema';
import { ContentSchema } from '@/components/Content/ContentSchema';
import { ContentGridSchema } from '@/components/ContentGrid/ContentGridSchema';
import { CtaBannerSchema } from '@/components/CtaBanner/CtaBannerSchema';
import { ImageSchema } from '@/components/Image/ImageSchema';
import { ImageBetweenSchema } from '@/components/ImageBetween/ImageBetweenSchema';
import { RegionsMapSchema } from '@/components/Region/RegionSchema';
import { RegionStatsSchema } from '@/components/RegionStats/RegionStatsSchema';
import { RichContentSchema } from '@/components/RichContent/RichContentSchema';

const PageContentUnion = z.union([
  BannerHeroSchema,
  ContentSchema,
  ContentGridSchema,
  CtaBannerSchema,
  ImageSchema,
  ImageBetweenSchema,
  RegionsMapSchema,
  RegionStatsSchema,
  RichContentSchema
]);
export type PageContent = z.infer<typeof PageContentUnion>;

export const PageSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  pageLayout: z
    .lazy(() => require('@/components/PageLayout/PageLayoutSchema').PageLayoutSchema)
    .optional(),
  pageContentCollection: z
    .object({
      items: z.array(PageContentUnion)
    })
    .optional(),
  openGraphImage: z.lazy(() => require('@/components/Image/ImageSchema').ImageSchema).optional(),
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
  pageLayout: z
    .lazy(() => require('@/components/PageLayout/PageLayoutSchema').PageLayoutSchema)
    .optional(),
  openGraphImage: z.lazy(() => require('@/components/Image/ImageSchema').ImageSchema).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  __typename: z.string().optional()
});

export type PageWithRefs = z.infer<typeof PageWithRefsSchema>;

export interface PageResponse {
  items: Page[];
  total: number;
}
