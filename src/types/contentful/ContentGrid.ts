import { z } from 'zod';
import { AssetSchema } from './Asset';
import { SectionHeadingSchema } from './SectionHeading';
import { ImageSchema } from './Image';
import { PostSchema } from './Post';
import { VideoSchema } from './Video';
import { ServiceSchema } from './Service';

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

// Union type for items
const ContentGridItemUnion = z.union([
  ContentGridItemSchema,
  PostSchema,
  VideoSchema,
  ServiceSchema
]);
export type ContentGridItemOrPost = z.infer<typeof ContentGridItemUnion>;

export const ContentGridSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
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
