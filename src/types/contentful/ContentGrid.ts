import { z } from 'zod';
import { AssetSchema } from './Asset';
import { ImageSchema } from './Image';
import { PostSchema } from './Post';
import { SectionHeadingSchema } from './SectionHeading';
import { ServiceSchema } from './Service';

// Define the ContentGridItem schema
export const ContentGridItemSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  heading: z.string(),
  description: z.string(),
  link: z
    .object({
      sys: z.object({
        id: z.string()
      }),
      slug: z.string()
    })
    .optional(),
  icon: AssetSchema.optional(),
  image: ImageSchema.optional(),
  __typename: z.string().optional()
});

export type ContentGridItem = z.infer<typeof ContentGridItemSchema>;

// Union type for items
const ContentGridItemUnion = z.union([ContentGridItemSchema, PostSchema, ServiceSchema]);
export type ContentGridItemOrPost = z.infer<typeof ContentGridItemUnion>;

export const ContentGridSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  isDarkMode: z.boolean().optional(),
  title: z.string(),
  heading: SectionHeadingSchema,
  backgroundImage: ImageSchema.optional(),
  itemsCollection: z.object({
    items: z.array(ContentGridItemUnion)
  }),
  __typename: z.string().optional()
});

export type ContentGrid = z.infer<typeof ContentGridSchema>;

export interface ContentGridResponse {
  items: ContentGrid[];
}
