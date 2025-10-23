import { z } from 'zod';

import { AccordionSchema } from '@/components/Accordion/AccordionSchema';
import { ContactCardSchema } from '@/components/ContactCard/ContactCardSchema';
import { ContentGridItemSchema } from '@/components/ContentGrid/ContentGridItemSchema';
import { CtaGridSchema } from '@/components/CtaGrid/CtaGridSchema';
import { EventSchema } from '@/components/Event/EventSchema';
import { ImageSchema } from '@/components/Image/ImageSchema';
import { OfficeLocationSchema } from '@/components/OfficeLocation/OfficeLocationSchema';
import { PageListSchema } from '@/components/PageList/PageListSchema';
import { PostSchema } from '@/components/Post/PostSchema';
import { ProductSchema } from '@/components/Product/ProductSchema';
import { SectionHeadingSchema } from '@/components/SectionHeading/SectionHeadingSchema';
import { SliderSchema } from '@/components/Slider/SliderSchema';
import { SolutionSchema } from '@/components/Solution/SolutionSchema';
import { VideoSchema } from '@/components/Video/VideoSchema';

// Schema for Contentful Asset (for backgroundAsset field)
const AssetSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string().optional(),
  description: z.string().optional(),
  url: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  contentType: z.string().optional()
});

// Union type for items
const ContentGridItemUnion = z.union([
  AccordionSchema,
  ContentGridItemSchema,
  CtaGridSchema,
  ContactCardSchema,
  EventSchema,
  ImageSchema,
  OfficeLocationSchema,
  PostSchema,
  ProductSchema,
  z.lazy(() => PageListSchema),
  SliderSchema,
  SolutionSchema,
  VideoSchema
]);
export type ContentGridItemOrPost = z.infer<typeof ContentGridItemUnion>;

export const ContentGridSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  theme: z.enum(['Light', 'Dark']),
  title: z.string(),
  variant: z.string(),
  heading: SectionHeadingSchema.optional(),
  itemsCollection: z
    .object({
      items: z.array(ContentGridItemUnion)
    })
    .optional(),
  backgroundImage: ImageSchema.optional(),
  backgroundAsset: AssetSchema.optional(),
  componentType: z.string().optional(),
  __typename: z.string().optional()
});

export type ContentGrid = z.infer<typeof ContentGridSchema>;

export interface ContentGridResponse {
  items: ContentGrid[];
}
