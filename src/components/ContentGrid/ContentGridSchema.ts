import { z } from 'zod';
import { ImageSchema } from '@/components/Image/ImageSchema';
import { PostSchema } from '@/components/Post/PostSchema';
import { SectionHeadingSchema } from '@/components/SectionHeading/SectionHeadingSchema';
import { ServiceSchema } from '@/components/Service/ServiceSchema';
import { ContentGridItemSchema } from './ContentGridItemSchema';
import { ContactCardSchema } from '@/components/ContactCard/ContactCardSchema';
import { CtaGridSchema } from '@/components/CtaGrid/CtaGridSchema';
import { VideoSchema } from '@/components/Video/VideoSchema';
import { SliderSchema } from '@/components/Slider/SliderSchema';
import { SolutionSchema } from '@/components/Solution/SolutionSchema';
import { ProductSchema } from '@/types/contentful/Product';
import { AccordionSchema } from '@/components/Accordion/AccordionSchema';
import { OfficeLocationSchema } from '@/components/OfficeLocation/OfficeLocationSchema';

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
