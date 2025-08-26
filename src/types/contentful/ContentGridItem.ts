import { z } from 'zod';
import { AssetSchema } from './Asset';
import { ImageSchema } from './Image';

// Define the ContentGridItem schema
export const ContentGridItemSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  heading: z.string(),
  description: z.string(),
  variant: z.string().optional(),
  icon: AssetSchema.optional(),
  image: ImageSchema.optional(),
  __typename: z.string().optional()
});

export type ContentGridItem = z.infer<typeof ContentGridItemSchema>;
