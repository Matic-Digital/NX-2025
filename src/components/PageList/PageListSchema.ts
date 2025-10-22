/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports, import/no-dynamic-require, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { ExternalPageSchema } from './ExternalPageSchema';
import { z } from 'zod';

import { BannerHeroSchema } from '@/components/BannerHero/BannerHeroSchema';
import { ContentSchema } from '@/components/Content/ContentSchema';
import { ContentGridSchema } from '@/components/ContentGrid/ContentGridSchema';
import { CtaBannerSchema } from '@/components/CtaBanner/CtaBannerSchema';
import { ImageBetweenSchema } from '@/components/ImageBetween/ImageBetweenSchema';
import { PageSchema } from '@/components/Page/PageSchema';
import { PostSchema } from '@/components/Post/PostSchema';
import { ProductSchema } from '@/components/Product/ProductSchema';
import { ServiceSchema } from '@/components/Service/ServiceSchema';
import { SolutionSchema } from '@/components/Solution/SolutionSchema';

// Define non-recursive unions first
const PageListContentUnion = z.union([
  BannerHeroSchema,
  ContentSchema,
  ContentGridSchema,
  CtaBannerSchema,
  ImageBetweenSchema,
  ProductSchema,
  SolutionSchema,
  ServiceSchema
]);
export type PageListContent = z.infer<typeof PageListContentUnion>;

// Define the base PageList schema without the recursive pagesCollection
const BasePageListSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string().optional(),
  slug: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  openGraphImage: z.lazy(() => require('./Image').ImageSchema).optional(),
  pageLayout: z.lazy(() => require('./PageLayoutSchema').PageLayoutSchema).optional(),
  pageContentCollection: z
    .object({
      items: z.array(PageListContentUnion)
    })
    .optional(),
  __typename: z.string().optional()
});

// Forward declare types for circular reference
type PageListType = {
  sys: { id: string };
  title?: string;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  openGraphImage?: unknown;
  pageLayout?: unknown;
  pageContentCollection?: {
    items: Array<{
      sys: { id: string };
      title?: string;
      description?: string;
      __typename?: string;
    }>;
  };
  pagesCollection?: { items: PageListPagesType[] };
  __typename?: string;
};

type PageListPagesType =
  | z.infer<typeof PageSchema>
  | z.infer<typeof ExternalPageSchema>
  | z.infer<typeof ProductSchema>
  | z.infer<typeof ServiceSchema>
  | z.infer<typeof SolutionSchema>
  | z.infer<typeof PostSchema>
  | PageListType;

// Define the recursive union using z.lazy for the full schema
const PageListPagesUnion: z.ZodType<PageListPagesType> = z.union([
  PageSchema,
  ExternalPageSchema,
  ProductSchema,
  ServiceSchema,
  SolutionSchema,
  PostSchema,
  z.lazy(() => PageListSchema)
]);
export type PageListPages = z.infer<typeof PageListPagesUnion>;

// Now define the full PageList schema with the recursive pagesCollection
export const PageListSchema: z.ZodType<PageListType> = BasePageListSchema.extend({
  pagesCollection: z
    .object({
      items: z.array(PageListPagesUnion)
    })
    .optional()
});

export type PageList = z.infer<typeof PageListSchema>;

export const PageListWithRefsSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string().optional(),
  slug: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  openGraphImage: z.lazy(() => require('./Image').ImageSchema).optional(),
  pageLayout: z.lazy(() => require('./PageLayoutSchema').PageLayoutSchema).optional(),
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

export interface PageListBySlugResponse {
  pageListCollection: {
    items: PageListWithRefs[];
  };
}

export interface PageListCollectionResponse {
  pageListCollection: {
    items: PageList[];
    total: number;
  };
}
