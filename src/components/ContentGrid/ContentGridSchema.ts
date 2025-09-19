import { z } from 'zod';
import { ImageSchema } from '@/types/contentful/Image';
import { PostSchema } from '@/components/Post/PostSchema';
import { SectionHeadingSchema } from '@/components/SectionHeading/SectionHeadingSchema';
import { ServiceSchema } from '@/types/contentful/Service';
import { ContentGridItemSchema } from './ContentGridItemSchema';
import { ContactCardSchema } from '@/components/ContactCard/ContactCardSchema';
import { CtaGridSchema } from '@/components/CtaGrid/CtaGridSchema';
import { VideoSchema } from '@/types/contentful/Video';
import { SliderSchema } from '@/components/Slider/SliderSchema';
import { SolutionSchema } from '@/types/contentful/Solution';
import { ProductSchema } from '@/types/contentful/Product';
import { AccordionSchema } from '@/components/Accordion/AccordionSchema';
import { OfficeLocationSchema } from '@/types/contentful/OfficeLocation';

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
