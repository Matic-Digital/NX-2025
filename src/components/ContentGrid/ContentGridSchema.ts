import { z } from 'zod';

import { AccordionSchema } from '@/components/Accordion/AccordionSchema';
import { ContactCardSchema } from '@/components/ContactCard/ContactCardSchema';
import { ContentGridItemSchema } from '@/components/ContentGrid/ContentGridItemSchema';
import { CtaGridSchema } from '@/components/CtaGrid/CtaGridSchema';
import { ImageSchema } from '@/components/Image/ImageSchema';
import { OfficeLocationSchema } from '@/components/OfficeLocation/OfficeLocationSchema';
import { PostSchema } from '@/components/Post/PostSchema';
import { ProductSchema } from '@/components/Product/ProductSchema';
import { SectionHeadingSchema } from '@/components/SectionHeading/SectionHeadingSchema';
import { ServiceSchema } from '@/components/Service/ServiceSchema';
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
  ImageSchema,
  OfficeLocationSchema,
  PostSchema,
  ProductSchema,
  ServiceSchema,
  SliderSchema,
  SolutionSchema,
  VideoSchema
]);
export type ContentGridItemOrPost = z.infer<typeof ContentGridItemUnion>;

export const ContentGridSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  heading: SectionHeadingSchema.optional(),
  backgroundImage: ImageSchema.optional(),
  backgroundAsset: AssetSchema.optional(),
  itemsCollection: z.object({
    items: z.array(ContentGridItemUnion)
  }),
  variant: z.string(),
  componentType: z.string().optional(),
  __typename: z.string().optional()
});

export type ContentGrid = z.infer<typeof ContentGridSchema>;

export interface ContentGridResponse {
  items: ContentGrid[];
}
