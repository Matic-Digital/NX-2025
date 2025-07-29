import { z } from 'zod';
import { AssetSchema } from './Asset';
import { SectionHeadingSchema } from './SectionHeading';
import { ImageSchema } from './Image';

// Define the ContentGridItem schema
export const ContentGridItemSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  description: z.string(),
  link: z.object({
    sys: z.object({
      id: z.string()
    }),
    slug: z.string()
  }),
  icon: AssetSchema.optional(),
  image: ImageSchema.optional(),
  __typename: z.string().optional()
});

export type ContentGridItem = z.infer<typeof ContentGridItemSchema>;

export const ContentGridSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  heading: SectionHeadingSchema,
  itemsCollection: z.object({
    items: z.array(ContentGridItemSchema)
  }),
  __typename: z.string().optional()
});

export type ContentGrid = z.infer<typeof ContentGridSchema>;

export interface ContentGridResponse {
  items: ContentGrid[];
}
