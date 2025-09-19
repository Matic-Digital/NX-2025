import { z } from 'zod';
import { AssetSchema } from '@/types/contentful/Asset';
import { ImageSchema } from '@/components/Image/ImageSchema';
import { ButtonSchema } from '@/components/Button/ButtonSchema';

// Define the ContentGridItem schema
export const ContentGridItemSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  heading: z.string(),
  ctaCollection: z
    .object({
      items: z.array(ButtonSchema)
    })
    .optional(),
  description: z.string(),
  icon: AssetSchema.optional(),
  image: ImageSchema.optional(),
  variant: z.string().optional(),
  __typename: z.string().optional()
});

export type ContentGridItem = z.infer<typeof ContentGridItemSchema>;
