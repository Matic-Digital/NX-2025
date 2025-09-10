import { z } from 'zod';
import { ImageSchema } from './Image';
import { PostSchema } from './Post';
import { SectionHeadingSchema } from './SectionHeading';
import { ServiceSchema } from './Service';
import { ContentGridItemSchema } from './ContentGridItem';
import { ContactCardSchema } from './ContactCard';
import { CtaGridSchema } from './CtaGrid';
import { VideoSchema } from './Video';
import { SliderSchema } from './Slider';
import { SolutionSchema } from './Solution';
import { ProductSchema } from './Product';
import { AccordionSchema } from './Accordion';
import { OfficeLocationSchema } from './OfficeLocation';

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
  isDarkMode: z.boolean().optional(),
  title: z.string(),
  heading: SectionHeadingSchema.optional(),
  backgroundImage: ImageSchema.optional(),
  itemsCollection: z.object({
    items: z.array(ContentGridItemUnion)
  }),
  componentType: z.string().optional(),
  __typename: z.string().optional()
});

export type ContentGrid = z.infer<typeof ContentGridSchema>;

export interface ContentGridResponse {
  items: ContentGrid[];
}
