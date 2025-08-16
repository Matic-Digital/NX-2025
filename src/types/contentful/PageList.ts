/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports, import/no-dynamic-require, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { z } from 'zod';
import { CtaBannerSchema } from './CtaBanner';
import { ContentGridSchema } from './ContentGrid';
import { BannerHeroSchema } from './BannerHero';
import { ImageBetweenSchema } from './ImageBetween';
import { PageSchema } from './Page';
import { ExternalPageSchema } from './ExternalPage';
import { ContentSchema } from './Content';
import { ProductSchema } from './Product';
import { ServiceSchema } from './Service';
import { SolutionSchema } from './Solution';
import { PostSchema } from './Post';

// Define non-recursive unions first
const PageListContentUnion = z.union([
  BannerHeroSchema,
  ContentSchema,
  ContentGridSchema,
  CtaBannerSchema,
  ImageBetweenSchema,
  ProductSchema
]);
export type PageListContent = z.infer<typeof PageListContentUnion>;

// Define the base PageList schema without the recursive pagesCollection
const BasePageListSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string().optional(),
  slug: z.string().optional(),
  pageLayout: z.lazy(() => require('./PageLayout').PageLayoutSchema).optional(),
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
  pageLayout?: unknown;
  pageContentCollection?: { items: unknown[] };
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
