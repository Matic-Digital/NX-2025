import { z } from 'zod';
import { ImageSchema } from './Image';
import { PostSchema } from '../../components/Post/PostSchema';
import { SectionHeadingSchema } from '../../components/SectionHeading/SectionHeadingSchema';
import { ServiceSchema } from './Service';
import { ContentGridItemSchema } from './ContentGridItem';
import { ContactCardSchema } from '../../components/ContactCard/ContactCardSchema';
import { CtaGridSchema } from './CtaGrid';
import { VideoSchema } from './Video';
import { SliderSchema } from './Slider';
import { SolutionSchema } from './Solution';
import { ProductSchema } from './Product';
import { AccordionSchema } from '../../components/Accordion/AccordionSchema';
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
